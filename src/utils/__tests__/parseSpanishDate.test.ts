import { parseSpanishDate } from '../parseSpanishDate';

describe('parseSpanishDate', () => {
  it('parses a valid date with double-digit hour', () => {
    const d = parseSpanishDate('14/04/2026 14:05:00');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(3); // April is month index 3
    expect(d!.getDate()).toBe(14);
    expect(d!.getHours()).toBe(14);
    expect(d!.getMinutes()).toBe(5);
    expect(d!.getSeconds()).toBe(0);
  });

  it('parses a valid date with single-digit hour', () => {
    const d = parseSpanishDate('14/04/2026 0:33:02');
    expect(d).not.toBeNull();
    expect(d!.getHours()).toBe(0);
    expect(d!.getMinutes()).toBe(33);
    expect(d!.getSeconds()).toBe(2);
  });

  it('returns null for empty string', () => {
    expect(parseSpanishDate('')).toBeNull();
  });

  it('returns null for invalid format', () => {
    expect(parseSpanishDate('not-a-date')).toBeNull();
    expect(parseSpanishDate('2026-04-14 14:05:00')).toBeNull();
    expect(parseSpanishDate('14/04/2026')).toBeNull();
  });
});
