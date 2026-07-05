// Free, no-key exchange rate feed (updates daily). Used to keep EUR/GBP/AED
// pricing in sync with the real market automatically — IRR stays admin-set
// in SiteSetting since Iran's real (unofficial) market rate isn't on any
// free feed and swings too fast for auto-pricing to be safe.
const LIVE_RATES_URL = "https://open.er-api.com/v6/latest/USD";

export interface LiveRates {
  usd_to_eur: number;
  usd_to_gbp: number;
  usd_to_aed: number;
}

export async function fetchLiveUsdRates(): Promise<LiveRates | null> {
  try {
    const res = await fetch(LIVE_RATES_URL, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = await res.json();
    const rates = data?.rates;
    if (!rates?.EUR || !rates?.GBP || !rates?.AED) return null;
    return {
      usd_to_eur: rates.EUR,
      usd_to_gbp: rates.GBP,
      usd_to_aed: rates.AED,
    };
  } catch {
    return null;
  }
}
