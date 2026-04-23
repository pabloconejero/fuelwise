/**
 * Parses the date format returned by the minetur API: "DD/MM/YYYY H:MM:SS"
 * (the hour component may be 1 or 2 digits).
 *
 * Returns null for invalid or empty input.
 *
 * Examples:
 *   "14/04/2026 0:28:19" → Date(2026-04-14T00:28:19)
 *   "14/04/2026 14:05:00" → Date(2026-04-14T14:05:00)
 */
export function parseSpanishDate(value: string): Date | null {
  if (!value || value.trim() === '') return null;

  // Expected: "DD/MM/YYYY H:MM:SS" or "DD/MM/YYYY HH:MM:SS"
  const match = value
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);

  if (!match) return null;

  const [, day, month, year, hours, minutes, seconds] = match;

  const d = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10),
    parseInt(seconds, 10),
  );

  return isNaN(d.getTime()) ? null : d;
}
