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

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

export function formatDate(date: Date): string {
  if (!isValidDate(date)) return "";
  return yearMonthDay.format(date);
}

export function formatYearMonth(date: Date): string {
  if (!isValidDate(date)) return "";
  return yearMonth.format(date);
}

export function formatPeriod(
  start: Date | undefined,
  end: Date | undefined,
): string | null {
  if (!start || !isValidDate(start)) return null;
  const startText = formatYearMonth(start);
  const endText = end && isValidDate(end) ? formatYearMonth(end) : "진행 중";
  return `${startText} — ${endText}`;
}
