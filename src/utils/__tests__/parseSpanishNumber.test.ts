import { parseSpanishNumber } from '../parseSpanishNumber';

describe('parseSpanishNumber', () => {
  it('returns null for empty string', () => {
    expect(parseSpanishNumber('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(parseSpanishNumber('   ')).toBeNull();
  });

  it('parses integer strings', () => {
    expect(parseSpanishNumber('2')).toBe(2);
    expect(parseSpanishNumber('100')).toBe(100);
  });

  it('parses decimal strings with comma separator', () => {
    expect(parseSpanishNumber('1,659')).toBeCloseTo(1.659);
    expect(parseSpanishNumber('40,528028')).toBeCloseTo(40.528028);
  });

  it('parses negative numbers', () => {
    expect(parseSpanishNumber('-1,5')).toBeCloseTo(-1.5);
  });

  it('returns null for garbage input', () => {
    expect(parseSpanishNumber('abc')).toBeNull();
    expect(parseSpanishNumber('1.659')).toBeNull(); // dot separator rejected
    expect(parseSpanishNumber('1,2,3')).toBeNull();
    expect(parseSpanishNumber('1,659 garbage')).toBeNull();
  });
});
