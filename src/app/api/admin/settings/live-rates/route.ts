export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { fetchLiveUsdRates } from "@/lib/liveRates";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const live = await fetchLiveUsdRates();
  if (!live) return NextResponse.json({ error: "دریافت نرخ لحظه‌ای ناموفق بود" }, { status: 502 });

  return NextResponse.json({ rates: live });
}
