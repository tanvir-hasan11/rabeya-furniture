const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** poisha -> "৳২,৪৯৯" (whole taka, Bengali numerals, lakh grouping). */
export function formatBDT(poisha: number): string {
  const taka = Math.round(poisha) / 100;
  const grouped = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(taka);
  return `৳${toBengaliDigits(grouped)}`;
}

/** Percent off, e.g. 2499 / 2999 -> 17 */
export function discountPercent(price: number, comparePrice?: number): number | null {
  if (!comparePrice || comparePrice <= price) return null;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}
