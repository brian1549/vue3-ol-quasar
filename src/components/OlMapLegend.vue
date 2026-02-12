<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  bucketKeys: string[];
  getVisible: (key: string) => boolean;
}>();

const allVisible = ref(true);

const emit = defineEmits<{
  (e: 'toggle', key: string, visible: boolean): void;
  (e: 'toggle-all', visible: boolean): void;
}>();
</script>

<template>
  <q-card class="q-pa-sm">
    <div class="text-subtitle2 q-mb-sm">Earthquake layers</div>
    <div class="row items-center justify-between q-py-xs">
      <div class="text-caption">Show/Hide All</div>
      <q-toggle
        :model-value="allVisible"
        dense
        @update:model-value="
          (val) => {
            allVisible = val;
            emit('toggle-all', val);
          }
        "
      />
    </div>

    <div v-for="key in bucketKeys" :key="key" class="row items-center justify-between q-py-xs">
      <div class="text-caption">{{ key }}</div>
      <q-toggle
        :model-value="getVisible(key)"
        dense
        @update:model-value="(val) => emit('toggle', key, val)"
      />
    </div>
  </q-card>
</template>
