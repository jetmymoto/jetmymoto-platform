import { describe, it, expect } from 'vitest';
import { resolveAirport } from './resolveAirport';

describe('resolveAirport', () => {
  it('should resolve by IATA code (uppercase)', () => {
    const result = resolveAirport('MUC');
    expect(result).toBeDefined();
    expect(result.code).toBe('MUC');
  });

  it('should resolve by IATA code (lowercase)', () => {
    const result = resolveAirport('muc');
    expect(result).toBeDefined();
    expect(result.code).toBe('MUC');
  });

  it('should resolve by city name (normalized)', () => {
    const result = resolveAirport('munich');
    expect(result).toBeDefined();
    expect(result.code).toBe('MUC');
  });

  it('should resolve by full slug', () => {
    const result = resolveAirport('munich-muc');
    expect(result).toBeDefined();
    expect(result.code).toBe('MUC');
  });

  it('should resolve by other IATA codes', () => {
    const mxp = resolveAirport('mxp');
    expect(mxp.code).toBe('MXP');

    const ams = resolveAirport('ams');
    expect(ams.code).toBe('AMS');
  });

  it('should return null for unknown codes', () => {
    const result = resolveAirport('XXXXX');
    expect(result).toBeNull();
  });
});
