<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import type { EarthquakeFeatureCollection } from './types';
import { getEarthquakes } from '@/api/earthquakes';
import { useEarthquakeLayers } from '@/composables/useEarthquakeLayers';
import OlMapLegend from '@/components/OlMapLegend.vue';
import OlMapTooltip from './OlMapTooltip.vue';
import { bucketByHalfMagnitude } from '@/utils/earthquakeUtils';

const mapEl = ref<HTMLDivElement | null>(null);
const bucketKeys = ref<string[]>([]);

const map = ref<OlMap | null>(null);

const earthquakeLayers = useEarthquakeLayers();

function toggle(key: string, visible: boolean): void {
  earthquakeLayers.setBucketVisible(key, visible);
}
function toggleAll(visible: boolean): void {
  bucketKeys.value.forEach((key) => toggle(key, visible));
}

onMounted(async () => {
  const geojson: EarthquakeFeatureCollection = await getEarthquakes();
  const buckets = bucketByHalfMagnitude(geojson.features);
  bucketKeys.value = earthquakeLayers.sortKeys(buckets);

  map.value = new OlMap({
    target: mapEl.value as HTMLDivElement,
    layers: [new TileLayer({ source: new OSM() })],
    view: new View({ center: [0, 0], zoom: 2 }),
  });

  earthquakeLayers.buildLayers(map.value as OlMap, buckets);
});

onBeforeUnmount(() => {
  earthquakeLayers.teardown((map.value as OlMap) ?? undefined);
  map.value?.setTarget(undefined);
  map.value = null;
});
</script>

<template>
  <div class="relative-position full-width" style="height: 500px">
    <div ref="mapEl" class="full-width full-height" />
    <div class="absolute-top-right q-ma-sm" style="width: 220px">
      <OlMapLegend
        :bucket-keys="bucketKeys"
        :get-visible="earthquakeLayers.getBucketVisible"
        @toggle="(key: string, val: boolean) => toggle(key, val)"
        @toggle-all="(val: boolean) => toggleAll(val)"
      />
      <OlMapTooltip v-if="map" :map="map as OlMap" />
    </div>
  </div>
</template>
