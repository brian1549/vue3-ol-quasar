<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'

const mapEl = ref<HTMLDivElement | null>(null)
let map: Map | null = null

onMounted(() => {
  const usgsUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'

  const quakesSource = new VectorSource({
    url: usgsUrl,
    format: new GeoJSON({
      featureProjection: 'EPSG:3857',
    }),
  })

  const quakesLayer = new VectorLayer({
    source: quakesSource,
  })

  map = new Map({
    target: mapEl.value as HTMLDivElement,
    layers: [new TileLayer({ source: new OSM() }), quakesLayer],
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  })

  quakesSource.once('featuresloadend', () => {
    const extent = quakesSource.getExtent()
    map?.getView().fit(extent, {
      padding: [40, 40, 40, 40],
      maxZoom: 8,
    })
  })
})

onBeforeUnmount(() => {
  map?.setTarget(undefined)
  map = null
})
</script>

<template>
  <div ref="mapEl" style="height: 500px; width: 100%" />
</template>
