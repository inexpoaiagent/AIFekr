export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/** Public — lists active ready-made prompts for a tool ("chat" | "image" | "video"), for users to pick from. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const toolType = searchParams.get("toolType") || "chat";

  const prompts = await prisma.prompt.findMany({
    where: { toolType, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ prompts });
}

/** Increments usedCount when a user picks a ready-made prompt — no auth required beyond existing, just a lightweight counter. */
export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id الزامی است" }, { status: 400 });
  await prisma.prompt.update({ where: { id }, data: { usedCount: { increment: 1 } } }).catch(() => null);
  return NextResponse.json({ success: true });
}
