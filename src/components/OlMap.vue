<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import type { EarthquakeFeature, EarthquakeFeatureCollection } from './types';
import { getEarthquakes } from '@/api/earthquakes';
import { isNumber } from 'lodash-es';
import { useEarthquakeLayers } from '@/composables/useEarthquakeLayers';

const mapEl = ref<HTMLDivElement | null>(null);
let map: OlMap | null = null;
const earthquakeLayers = useEarthquakeLayers();
const bucketKeys = ref<string[]>([]);

// Bucket into 0.5 magnitude bins (e.g., "2.0-2.5")
function bucketByHalfMagnitude(features: EarthquakeFeature[]): Map<string, EarthquakeFeature[]> {
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

function toggleBucket(key: string, visible: boolean) {
  earthquakeLayers.setBucketVisible(key, visible);
}

onMounted(async () => {
  // New: manual fetch + bucketing
  const geojson: EarthquakeFeatureCollection = await getEarthquakes();
  const buckets = bucketByHalfMagnitude(geojson.features);
  bucketKeys.value = earthquakeLayers.sortKeys(buckets);

  map = new OlMap({
    target: mapEl.value as HTMLDivElement,
    layers: [new TileLayer({ source: new OSM() })],
    view: new View({ center: [0, 0], zoom: 2 }),
  });

  earthquakeLayers.buildLayers(map, buckets);
});

onBeforeUnmount(() => {
  earthquakeLayers.teardown(map ?? undefined);
  map?.setTarget(undefined);
  map = null;
});
</script>

<template>
  <div class="relative-position" style="height: 500px; width: 100%">
    <div ref="mapEl" style="height: 100%; width: 100%" />

    <q-card class="q-pa-sm" style="position: absolute; top: 12px; right: 12px; width: 220px">
      <div class="text-subtitle2 q-mb-sm">Earthquake layers</div>

      <div v-for="key in bucketKeys" :key="key" class="row items-center justify-between q-py-xs">
        <div class="text-caption">{{ key }}</div>
        <q-toggle
          :model-value="earthquakeLayers.getBucketVisible(key)"
          dense
          @update:model-value="(val) => toggleBucket(key, val)"
        />
      </div>
    </q-card>
  </div>
</template>
