/**
 * Returns a "YYYY-MM-DD" string for a given Date in the specified IANA timezone
 * (defaults to Europe/Madrid).
 *
 * Used to build daily cache keys that align with Spain's price-update schedule,
 * regardless of the device's local timezone.
 *
 * Requires the Intl API with timezone support (available in Hermes on Expo 54+).
 */
export function dayKey(date: Date, tz = 'Europe/Madrid'): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // en-CA locale formats as YYYY-MM-DD natively.
  return fmt.format(date);
}
