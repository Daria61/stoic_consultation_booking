export function formatDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export const isDayDisabled = (
  date?: Date,
  selectDateOptions: string[] = [],
) => {
  if (!date) return true;

  // Convert Date → YYYY-MM-DD
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const formatted = `${yyyy}-${mm}-${dd}`;

  // Disable if NOT in available dates
  return !selectDateOptions.includes(formatted);
};
