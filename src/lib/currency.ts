"use client";

export {
  type Currency,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES,
  DEFAULT_RATES,
  convertPrice,
  formatPrice,
} from "./currencyShared";

import type { Currency } from "./currencyShared";

export function getCurrency(): Currency {
  if (typeof document === "undefined") return "USD";
  const match = document.cookie.match(/(?:^|;\s*)currency=([^;]*)/);
  const val = match ? match[1] : null;
  return (val && ["USD", "EUR", "IRR", "AED", "GBP"].includes(val)) ? (val as Currency) : "USD";
}

export function setCurrency(c: Currency) {
  document.cookie = `currency=${c}; path=/; max-age=31536000`;
}
