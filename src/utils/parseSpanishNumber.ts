/**
 * Parses a Spanish-locale number string (comma as decimal separator) to a JS number.
 * Returns null for empty strings or invalid input.
 *
 * Examples:
 *   "1,659" → 1.659
 *   "40,528028" → 40.528028
 *   "" → null
 *   "garbage" → null
 */
export function parseSpanishNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;

  // Allow optional minus, digits, optional comma + more digits only.
  if (!/^-?\d+(,\d+)?$/.test(trimmed)) return null;

  const normalized = trimmed.replace(',', '.');
  const result = parseFloat(normalized);
  return isNaN(result) ? null : result;
}
