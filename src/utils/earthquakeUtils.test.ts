import { describe, it, expect } from 'vitest';
import { bucketByHalfMagnitude } from '@/utils/earthquakeUtils';
import { earthquakesMock } from '@/mocks/earthquake.mock';
import type { EarthquakeFeature } from '@/components/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function quake(mag: any): EarthquakeFeature {
  return {
    type: 'Feature',
    properties: { mag },
    geometry: { type: 'Point', coordinates: [0, 0, 0] },
    id: String(mag),
  };
}

describe('bucketByHalfMagnitude', () => {
  it('buckets into 0.5 magnitude ranges', () => {
    const buckets = bucketByHalfMagnitude(earthquakesMock.features);

    expect(buckets.has('0.5-1.0')).toEqual(true);
    expect(buckets.has('1.0-1.5')).toEqual(true);
    expect(buckets.has('1.5-2.0')).toEqual(true);
    expect(buckets.has('2.0-2.5')).toEqual(true);
    expect(buckets.has('2.5-3.0')).toEqual(false);
  });

  it('groups multiple quakes into the same bucket', () => {
    const buckets = bucketByHalfMagnitude(earthquakesMock.features);

    expect(buckets.has('1.5-2.0')).toEqual(true);
    const bucket = buckets.get('1.5-2.0');
    expect(bucket?.length).toEqual(2);
  });

  it('skips non-numeric magnitudes', () => {
    const buckets = bucketByHalfMagnitude([
      quake(undefined),
      quake(null),
      quake('2.0'),
      quake(2.0),
    ]);

    expect(Array.from(buckets.keys())).toEqual(['2.0-2.5']);
    expect(buckets.get('2.0-2.5')?.length).toBe(1);
  });
});
