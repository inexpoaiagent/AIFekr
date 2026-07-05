export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { createPayment } from "@/lib/payment/zarinpal";

// Discount applied storefront-wide — must match DISCOUNT_PERCENT in
// src/app/(dashboard)/plans/page.tsx so the displayed price always
// matches what's actually charged.
const DISCOUNT_PERCENT = 20;

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const { plan } = await req.json();
  const pkg = await prisma.package.findUnique({ where: { planCode: plan } });
  if (!pkg || !pkg.isActive) return NextResponse.json({ error: "پلن نامعتبر" }, { status: 400 });

  const toman = Math.round((pkg.price / 10) * (1 - DISCOUNT_PERCENT / 100));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";

  // Create pending payment record
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amount: toman,
      plan,
      status: "PENDING",
      gateway: "zarinpal",
    },
  });

  const result = await createPayment({
    amount: toman,
    description: `خرید اشتراک ${plan} — هوشمند AI`,
    callbackUrl: `${appUrl}/api/payment/verify?paymentId=${payment.id}`,
    mobile: user.phone || undefined,
    email: user.email || undefined,
    metadata: { planId: plan, paymentDbId: payment.id },
  });

  if (!result.ok) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.json({ error: result.error || "خطا در ایجاد پرداخت" }, { status: 500 });
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { authority: result.authority } });

  return NextResponse.json({ paymentUrl: result.paymentUrl, paymentId: payment.id });
}
