export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPayment } from "@/lib/payment/zarinpal";
import { sendPaymentConfirmEmail } from "@/lib/email/resend";
import { redirect } from "next/navigation";

const PLAN_INFO: Record<string, { credits: number; days: number }> = {
  BASIC: { credits: 2000, days: 30 },
  PRO:   { credits: 6000, days: 30 },
  TEAM:  { credits: 20000, days: 30 },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("Status");
  const authority = searchParams.get("Authority");
  const paymentId = searchParams.get("paymentId");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";

  if (status !== "OK" || !authority || !paymentId) {
    return NextResponse.redirect(`${appUrl}/plans?payment=failed`);
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true },
  });

  if (!payment || payment.status !== "PENDING") {
    return NextResponse.redirect(`${appUrl}/plans?payment=failed`);
  }

  const result = await verifyPayment({ authority, amount: payment.amount });

  if (!result.ok) {
    await prisma.payment.update({ where: { id: paymentId }, data: { status: "FAILED" } });
    return NextResponse.redirect(`${appUrl}/plans?payment=failed`);
  }

  // Success — activate plan
  const planInfo = PLAN_INFO[payment.plan];
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (planInfo?.days || 30));

  if (payment.plan === "TEAM") {
    // TEAM credits are pooled on a Team row, not on User.credits directly —
    // see src/lib/utils/teamCredits.ts. Create the team (and seat the buyer
    // as its owner/first member) on first purchase; top up credits/expiry
    // on renewal.
    const existingTeam = await prisma.team.findUnique({ where: { ownerId: payment.userId } });

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: { status: "SUCCESS", refId: result.refId, authority },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: { plan: "TEAM", planExpiry: expiry },
      }),
      existingTeam
        ? prisma.team.update({
            where: { id: existingTeam.id },
            data: { credits: { increment: planInfo?.credits || 0 }, planExpiry: expiry },
          })
        : prisma.team.create({
            data: {
              name: `تیم ${payment.user.name || "من"}`,
              ownerId: payment.userId,
              credits: planInfo?.credits || 0,
              planExpiry: expiry,
              members: { create: { userId: payment.userId, role: "OWNER" } },
            },
          }),
    ]);
  } else {
    await Promise.all([
      prisma.payment.update({
        where: { id: paymentId },
        data: { status: "SUCCESS", refId: result.refId, authority },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: payment.plan,
          credits: { increment: planInfo?.credits || 0 },
          planExpiry: expiry,
        },
      }),
    ]);
  }

  // Send confirmation email
  if (payment.user.email) {
    sendPaymentConfirmEmail(
      payment.user.email,
      payment.user.name || "کاربر",
      payment.plan,
      payment.amount,
      result.refId || ""
    ).catch(console.error);
  }

  return NextResponse.redirect(`${appUrl}/plans?payment=success&ref=${result.refId}`);
}
