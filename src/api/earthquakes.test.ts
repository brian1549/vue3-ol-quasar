import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getEarthquakes } from '@/api/earthquakes';
import * as handlers from '@/mocks/handlers';

describe('getEarthquakes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns feature collection', async () => {
    const result = await getEarthquakes();

    expect(result.type).toBe('FeatureCollection');
    expect(Array.isArray(result.features)).toBe(true);
    expect(result.features.length).toEqual(5);
  });

  it('uses cache within TTL (only fetches once)', async () => {
    const fetchSpy = vi.spyOn(handlers, 'getEarthquakesHandler');

    await getEarthquakes({ ttlMs: 60_000 });
    await getEarthquakes({ ttlMs: 60_000 });

    // should have fetched only once
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('dedupes concurrent callers (only one fetch)', async () => {
    const fetchSpy = vi.spyOn(handlers, 'getEarthquakesHandler');

    await Promise.all([
      getEarthquakes({ ttlMs: 60_000 }),
      getEarthquakes({ ttlMs: 60_000 }),
      getEarthquakes({ ttlMs: 60_000 }),
    ]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
