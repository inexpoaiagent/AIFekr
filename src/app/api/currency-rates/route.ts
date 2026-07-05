export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { fetchLiveUsdRates } from "@/lib/liveRates";
import { DEFAULT_RATES } from "@/lib/currencyShared";

// Public — no auth. IRR is always the admin-set value (SiteSetting, falls
// back to DEFAULT_RATES). EUR/GBP/AED come from the live feed when it's
// reachable, otherwise fall back to the admin-set/default value too.
export async function GET() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["usd_to_irr", "usd_to_aed", "usd_to_eur", "usd_to_gbp"] } },
  });
  const stored: Record<string, number> = {};
  for (const s of settings) {
    const n = Number(s.value);
    if (!isNaN(n)) stored[s.key] = n;
  }

  const live = await fetchLiveUsdRates();

  const rates = {
    usd_to_irr: stored.usd_to_irr ?? DEFAULT_RATES.usd_to_irr,
    usd_to_eur: live?.usd_to_eur ?? stored.usd_to_eur ?? DEFAULT_RATES.usd_to_eur,
    usd_to_gbp: live?.usd_to_gbp ?? stored.usd_to_gbp ?? DEFAULT_RATES.usd_to_gbp,
    usd_to_aed: live?.usd_to_aed ?? stored.usd_to_aed ?? DEFAULT_RATES.usd_to_aed,
  };

  return NextResponse.json({ rates, live: !!live });
}
