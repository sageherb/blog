const KO_LOCALE = "ko-KR";

const yearMonthDay = new Intl.DateTimeFormat(KO_LOCALE, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const yearMonth = new Intl.DateTimeFormat(KO_LOCALE, {
  year: "numeric",
  month: "long",
});

/** "2026년 5월 4일" */
export function formatDate(date: Date): string {
  return yearMonthDay.format(date);
}

/** "2026년 5월" */
export function formatYearMonth(date: Date): string {
  return yearMonth.format(date);
}

/**
 * Project period text.
 * - both dates → "2026년 3월 — 2026년 5월"
 * - only start → "2026년 3월 — 진행 중"
 * - no start   → null (caller decides on a fallback, e.g. formatDate(pubDate))
 */
export function formatPeriod(
  start: Date | undefined,
  end: Date | undefined,
): string | null {
  if (!start) return null;
  return `${formatYearMonth(start)} — ${end ? formatYearMonth(end) : "진행 중"}`;
}
