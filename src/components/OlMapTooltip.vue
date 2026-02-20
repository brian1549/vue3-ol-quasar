<script setup lang="ts">
import type { FeatureLike } from 'ol/Feature';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type OlMap from 'ol/Map';

const { map } = defineProps<{
  map: OlMap | null;
}>();

const hovered = ref<{ mag?: number; place?: string; time?: number } | null>(null);
const hoverPos = ref<{ x: number; y: number } | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onPointerMove(evt: any) {
  if (evt.dragging) return;

  if (!map) return;

  const feature = map.forEachFeatureAtPixel(evt.pixel, (f: FeatureLike) => f);

  if (!feature) {
    hovered.value = null;
    hoverPos.value = null;
    return;
  }

  hovered.value = {
    mag: feature.get('mag'),
    place: feature.get('place'),
    time: feature.get('time'),
  };

  hoverPos.value = { x: evt.originalEvent.clientX, y: evt.originalEvent.clientY };
}

onMounted(async () => {
  map?.on('pointermove', onPointerMove);
});

onBeforeUnmount(() => {
  map?.un('pointermove', onPointerMove);
});
</script>

<template>
  <div
    v-if="hovered && hoverPos"
    class="q-pa-xs bg-grey-9 text-white text-caption"
    :style="{
      position: 'fixed',
      left: hoverPos.x + 12 + 'px',
      top: hoverPos.y + 12 + 'px',
      pointerEvents: 'none',
      borderRadius: '6px',
      zIndex: 9999,
    }"
  >
    <div>
      <b>M {{ hovered.mag }}</b>
    </div>
    <div>{{ hovered.place }}</div>
  </div>
</template>
