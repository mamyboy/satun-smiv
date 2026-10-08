const nf = new Intl.NumberFormat("th-TH");
const compact = new Intl.NumberFormat("th-TH", { notation: "compact", maximumFractionDigits: 1 });

export const fmtNum = (n: number) => nf.format(Math.round(n));
export const fmtCompact = (n: number) => compact.format(n);

/** Percent with optional sign, 1 decimal. */
export function fmtPct(n: number, signed = true) {
  const s = `${Math.abs(n).toFixed(1)}%`;
  if (!signed) return s;
  return n > 0 ? `+${s}` : n < 0 ? `−${s}` : s;
}

/** Truncate long Thai disease labels for chart axes (full text stays in tooltips). */
export function shortLabel(s: string, max = 26) {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}
