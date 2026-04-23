import { dayKey } from '../dayKey';

describe('dayKey', () => {
  it('returns a YYYY-MM-DD string', () => {
    const d = new Date('2026-04-14T10:00:00.000Z');
    expect(dayKey(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns the Madrid local date regardless of UTC offset', () => {
    // 2026-04-13 23:30 UTC = 2026-04-14 01:30 CEST (Madrid is UTC+2 in summer)
    const d = new Date('2026-04-13T23:30:00.000Z');
    expect(dayKey(d, 'Europe/Madrid')).toBe('2026-04-14');
  });

  it('returns UTC-1 date as still same day in Madrid', () => {
    // 2026-04-14 00:30 UTC = 2026-04-14 02:30 CEST
    const d = new Date('2026-04-14T00:30:00.000Z');
    expect(dayKey(d, 'Europe/Madrid')).toBe('2026-04-14');
  });

  it('handles CET (UTC+1) in winter correctly', () => {
    // Jan 15 2026 22:30 UTC = Jan 15 2026 23:30 CET (UTC+1)
    const d = new Date('2026-01-15T22:30:00.000Z');
    expect(dayKey(d, 'Europe/Madrid')).toBe('2026-01-15');
  });

  it('handles spring DST transition in Madrid (last Sunday March 2026 = March 29)', () => {
    // 2026-03-29 00:59 UTC = 01:59 CET, just before clocks jump to 03:00
    const beforeDst = new Date('2026-03-29T00:59:00.000Z');
    expect(dayKey(beforeDst, 'Europe/Madrid')).toBe('2026-03-29');

    // 2026-03-29 01:01 UTC = 03:01 CEST (clocks jumped)
    const afterDst = new Date('2026-03-29T01:01:00.000Z');
    expect(dayKey(afterDst, 'Europe/Madrid')).toBe('2026-03-29');
  });

  it('handles autumn DST transition in Madrid (last Sunday October 2026 = October 25)', () => {
    // 2026-10-25 00:59 UTC = 02:59 CEST, clocks fall back at 03:00 -> 02:00
    const beforeFall = new Date('2026-10-25T00:59:00.000Z');
    expect(dayKey(beforeFall, 'Europe/Madrid')).toBe('2026-10-25');

    const afterFall = new Date('2026-10-25T01:01:00.000Z');
    expect(dayKey(afterFall, 'Europe/Madrid')).toBe('2026-10-25');
  });

  it('accepts a custom timezone override', () => {
    // UTC midnight is still the previous day in US timezones
    const d = new Date('2026-04-14T01:00:00.000Z');
    expect(dayKey(d, 'America/New_York')).toBe('2026-04-13');
  });
});
