import type { EarthquakeFeatureCollection } from '@/components/types';
import type { CacheEntry } from './types';

const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

let cache: CacheEntry<EarthquakeFeatureCollection> | null = null;

export async function getEarthquakes(options?: { ttlMs?: number }) {
  const ttlMs = options?.ttlMs ?? 5 * 60_000; // default 5 minutes
  const now = Date.now();

  // fresh cache
  if (cache?.value && now < cache.expiresAt) return cache.value;

  // dedupe concurrent callers
  if (cache?.inFlight) return cache.inFlight;

  const p = (async () => {
    const res = await fetch(USGS_URL);
    if (!res.ok) throw new Error(`USGS fetch failed: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as EarthquakeFeatureCollection;

    cache = { value: data, expiresAt: now + ttlMs };
    return data;
  })();

  cache = { ...cache, inFlight: p, expiresAt: now + ttlMs };

  try {
    return await p;
  } finally {
    // clear inFlight whether success or error
    if (cache) cache.inFlight = undefined;
  }
}
