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

export function formatDate(date: Date): string {
  return yearMonthDay.format(date);
}

export function formatYearMonth(date: Date): string {
  return yearMonth.format(date);
}

export function formatPeriod(
  start: Date | undefined,
  end: Date | undefined,
): string | null {
  if (!start) return null;
  return `${formatYearMonth(start)} — ${end ? formatYearMonth(end) : "진행 중"}`;
}
