import type { EarthquakeFeature } from '@/components/types';
import { isNumber } from 'lodash-es';

export function bucketByHalfMagnitude(
  features: EarthquakeFeature[],
): Map<string, EarthquakeFeature[]> {
  return features.reduce((acc, quake) => {
    const mag = quake.properties?.mag;

    if (!isNumber(mag)) {
      return acc;
    }

    const low = Math.floor(mag * 2) / 2;
    const high = low + 0.5;
    const key = `${low.toFixed(1)}-${high.toFixed(1)}`;

    if (acc.has(key)) {
      acc.get(key)!.push(quake);
    } else {
      acc.set(key, [quake]);
    }

    return acc;
  }, new Map<string, EarthquakeFeature[]>());
}
