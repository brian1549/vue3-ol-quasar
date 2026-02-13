// src/composables/useEarthquakeLayers.test.ts
import { describe, it, expect, vi } from 'vitest';
import type OLMap from 'ol/Map';
import { useEarthquakeLayers } from '@/composables/useEarthquakeLayers';
import { earthquakesMock } from '@/mocks/earthquake.mock'; // adjust path if needed
import type { EarthquakeFeature } from '@/components/types';

function makeFakeMap(): Pick<OLMap, 'addLayer' | 'removeLayer'> {
  return {
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
  };
}

function featureFromMock(index: number): EarthquakeFeature {
  return earthquakesMock.features[index] as unknown as EarthquakeFeature;
}

describe('useEarthquakeLayers', () => {
  it('buildLayers adds one layer per non-empty bucket and sets visibility true', () => {
    const map = makeFakeMap();
    const l = useEarthquakeLayers();

    const buckets = new Map<string, EarthquakeFeature[]>([
      ['0.5-1.0', [featureFromMock(1)]],
      ['1.0-1.5', []], // should skip
      ['1.5-2.0', [featureFromMock(0), featureFromMock(4)]],
    ]);

    l.buildLayers(map as unknown as OLMap, buckets);

    expect(map.addLayer).toHaveBeenCalledTimes(2);
    expect(l.layersByBucket.value.size).toBe(2);
    expect(l.getBucketVisible('0.5-1.0')).toBe(true);
    expect(l.getBucketVisible('1.5-2.0')).toBe(true);
  });

  it('setBucketVisible updates both layer visibility and tracked visibility', () => {
    const map = makeFakeMap();
    const l = useEarthquakeLayers();

    const buckets = new Map<string, EarthquakeFeature[]>([['1.5-2.0', [featureFromMock(0)]]]);

    l.buildLayers(map as unknown as OLMap, buckets);

    l.setBucketVisible('1.5-2.0', false);

    expect(l.getBucketVisible('1.5-2.0')).toBe(false);
    expect(l.isBucketVisible('1.5-2.0')).toBe(false);
  });

  it('teardown removes layers from map and clears internal state', () => {
    const map = makeFakeMap();
    const l = useEarthquakeLayers();

    const buckets = new Map<string, EarthquakeFeature[]>([
      ['1.5-2.0', [featureFromMock(0)]],
      ['2.0-2.5', [featureFromMock(2)]],
    ]);

    l.buildLayers(map as unknown as OLMap, buckets);
    expect(l.layersByBucket.value.size).toBe(2);

    l.teardown(map as unknown as OLMap);

    expect(map.removeLayer).toHaveBeenCalledTimes(2);
    expect(l.layersByBucket.value.size).toBe(0);
    expect(l.visibleByBucket.value.size).toBe(0);
  });

  it('sortKeys sorts by numeric low bound', () => {
    const l = useEarthquakeLayers();

    const buckets = new Map<string, EarthquakeFeature[]>([
      ['2.0-2.5', []],
      ['0.5-1.0', []],
      ['10.0-10.5', []],
    ]);

    expect(l.sortKeys(buckets)).toEqual(['0.5-1.0', '2.0-2.5', '10.0-10.5']);
  });
});
