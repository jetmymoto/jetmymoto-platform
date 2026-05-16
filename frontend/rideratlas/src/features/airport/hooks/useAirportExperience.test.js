import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAirportExperience } from './useAirportExperience';

// Mock the graph and rental shard
vi.mock('@/core/network/networkGraph', () => ({
  readGraphSnapshot: () => ({
    airports: {
      MUC: { code: 'MUC', name: 'Munich Airport', city: 'Munich' }
    },
    indexes: {
      missionsByInsertion: {
        MUC: ['mission-1', 'mission-2']
      }
    }
  }),
  readGraphShard: () => ({
    rentalIndexes: {
      rentalsByAirport: {
        MUC: ['rental-1']
      }
    }
  })
}));

describe('useAirportExperience', () => {
  it('should return the correct payload for a known airport with both options', () => {
    const { result } = renderHook(() => useAirportExperience('MUC'));
    
    expect(result.current).toMatchObject({
      airport: {
        code: 'MUC',
        name: 'Munich Airport',
      },
      ride_local: {
        available: true,
        mission_count: 2,
        rental_count: 1,
      },
      bring_your_own: {
        available: true,
      },
      network_intel: expect.any(Object),
      summary: {
        default_path: 'bring_your_own',
        bias: {
          ride_local: 'strong',
          bring_your_own: 'strong',
        }
      }
    });
  });

  it('should maintain strong bias for bring_your_own even when no local missions exist', () => {
    const { result } = renderHook(() => useAirportExperience('AMS'));
    
    expect(result.current.summary.default_path).toBe('bring_your_own');
    expect(result.current.summary.bias.ride_local).toBe('none');
    expect(result.current.summary.bias.bring_your_own).toBe('strong');
    expect(result.current.bring_your_own.available).toBe(true);
  });

  it('should return null if no code is provided', () => {
    const { result } = renderHook(() => useAirportExperience(null));
    expect(result.current).toBeNull();
  });
});

