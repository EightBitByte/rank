const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeTime(
  pastMs: number,
  nowMs: number = Date.now(),
): string {
  const diff = nowMs - pastMs;

  for (const [unit, unitMs] of UNITS) {
    if (diff >= unitMs) {
      return rtf.format(-Math.floor(diff / unitMs), unit);
    }
  }

  return "just now";
}
