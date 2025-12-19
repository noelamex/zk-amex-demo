/**
 * Simple cutoff date: "today minus 21 years".
 * For demo we don't worry about time zones, etc.
 */
export function getAge21CutoffDate() {
  const now = new Date();
  const cutoff = new Date(now.getFullYear() - 21, now.getMonth(), now.getDate());

  return {
    year: cutoff.getFullYear(),
    month: cutoff.getMonth() + 1,
    day: cutoff.getDate(),
  };
}
