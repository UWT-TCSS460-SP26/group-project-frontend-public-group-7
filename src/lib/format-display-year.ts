export function formatDisplayYear(year: number | null | undefined) {
  if (!year || year <= 0) {
    return null;
  }

  return String(year);
}

export function formatDisplayYearFromDate(date: string | null | undefined) {
  const yearText = date?.slice(0, 4) ?? "";
  const year = Number(yearText);

  if (!yearText || Number.isNaN(year) || year <= 0) {
    return null;
  }

  return yearText;
}
