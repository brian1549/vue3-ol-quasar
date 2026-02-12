import { ref, shallowRef } from 'vue';
import type OLMap from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import type { EarthquakeFeature } from '@/components/types';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

export type BucketKey = string;

export function useEarthquakeLayers() {
  const layersByBucket = shallowRef(new Map<BucketKey, VectorLayer<VectorSource>>());
  const visibleByBucket = ref(new Map<BucketKey, boolean>());
  const format = new GeoJSON({ featureProjection: 'EPSG:3857' });

  function buildLayers(map: OLMap, buckets: Map<BucketKey, EarthquakeFeature[]>) {
    const sortedKeys = sortKeys(buckets);
    const colors = generatePalette(sortedKeys.length);

    sortedKeys.forEach((key, index) => {
      const features = buckets.get(key) ?? [];
      if (features.length === 0) return;

      const olFeatures = format.readFeatures({
        type: 'FeatureCollection',
        features: features,
      });

      const quakesSource = new VectorSource({ features: olFeatures });
      const quakesLayer = new VectorLayer({
        source: quakesSource,
        style: createStyle(colors[index]),
      });

      map.addLayer(quakesLayer);
      layersByBucket.value.set(key, quakesLayer);
      visibleByBucket.value.set(key, true);
    });
  }

  function sortKeys(buckets: Map<BucketKey, EarthquakeFeature[]>): string[] {
    return Array.from(buckets.keys()).sort((a, b) => {
      const aLow = parseFloat(a.split('-')[0] ?? '0');
      const bLow = parseFloat(b.split('-')[0] ?? '0');
      return aLow - bLow;
    });
  }

  function isBucketVisible(bucketKey: BucketKey): boolean {
    return layersByBucket.value.get(bucketKey)?.getVisible() ?? true;
  }
  function getBucketVisible(bucketKey: BucketKey): boolean {
    return visibleByBucket.value.get(bucketKey) ?? true;
  }

  function createStyle(color: string) {
    return (feature) => {
      const mag = feature.get('mag') ?? 0;

      return new Style({
        image: new CircleStyle({
          radius: 4 + mag * 2,
          fill: new Fill({
            color: color.replace('hsl', 'hsla').replace(')', ', 0.7)'),
          }),
          stroke: new Stroke({
            color: '#000',
            width: 1,
          }),
        }),
      });
    };
  }

  function generatePalette(count: number): string[] {
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
      const hue = 240 - (i / count) * 240;
      const saturation = 70;
      const lightness = 50;

      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  }

  function setBucketVisible(bucketKey: BucketKey, visible: boolean) {
    layersByBucket.value.get(bucketKey)?.setVisible(visible);
    visibleByBucket.value.set(bucketKey, visible);
  }

  function teardown(map?: OLMap) {
    if (!map) return;

    for (const layer of layersByBucket.value.values()) {
      map.removeLayer(layer);
    }

    layersByBucket.value.clear();
    visibleByBucket.value.clear();
  }

  return {
    layersByBucket,
    visibleByBucket,
    buildLayers,
    sortKeys,
    getBucketVisible,
    isBucketVisible,
    setBucketVisible,
    teardown,
  };
}
