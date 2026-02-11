<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';

import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import type { EarthquakeFeature, EarthquakeFeatureCollection } from './types';
import { getEarthquakes } from '@/api/earthquakes';

const mapEl = ref<HTMLDivElement | null>(null);
let map: OlMap | null = null;

// Bucket into 0.5 magnitude bins (e.g., "2.0-2.5")
function bucketByHalfMagnitude(features: EarthquakeFeature[]): Map<string, EarthquakeFeature[]> {
  return features.reduce((acc, quake) => {
    const mag = quake.properties?.mag;
    if (typeof mag !== 'number' || Number.isNaN(mag)) {
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

onMounted(async () => {
  // New: manual fetch + bucketing
  const geojson: EarthquakeFeatureCollection = await getEarthquakes();
  const buckets = bucketByHalfMagnitude(geojson.features);
  const format = new GeoJSON({ featureProjection: 'EPSG:3857' });

  const quakesSource = new VectorSource({
    features: format.readFeatures(geojson),
  });

  const quakesLayer = new VectorLayer({ source: quakesSource });

  map = new OlMap({
    target: mapEl.value as HTMLDivElement,
    layers: [new TileLayer({ source: new OSM() }), quakesLayer],
    view: new View({ center: [0, 0], zoom: 2 }),
  });

  // For now, just prove it worked:
  console.log('Buckets (0.5 mag):', Array.from(buckets.keys()).sort());
  console.log(
    'Example bucket counts:',
    Array.from(buckets.entries()).map(([k, v]) => [k, v.length]),
  );
});

onBeforeUnmount(() => {
  map?.setTarget(undefined);
  map = null;
});
</script>

<template>
  <div ref="mapEl" style="height: 500px; width: 100%" />
</template>
