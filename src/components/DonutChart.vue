<template>
  <div class="donut">
    <svg :viewBox="`0 0 ${size} ${size}`" class="donut-svg">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="#eef0f5"
        :stroke-width="thickness"
      />
      <circle
        v-for="seg in segments"
        :key="seg.key"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="seg.color"
        :stroke-width="thickness"
        :stroke-dasharray="`${seg.length} ${circumference - seg.length}`"
        :stroke-dashoffset="seg.offset"
        stroke-linecap="butt"
        :transform="`rotate(-90 ${center} ${center})`"
      />
    </svg>
    <div class="donut-center">
      <span class="donut-label">{{ label }}</span>
      <span class="donut-value">{{ value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: { key: string; value: number; color: string }[];
  label: string;
  value: string;
}>();

const size = 220;
const thickness = 26;
const center = size / 2;
const radius = center - thickness / 2;
const circumference = 2 * Math.PI * radius;

const segments = computed(() => {
  const total = props.data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return [];
  let cumulative = 0;
  const gap = props.data.length > 1 ? 4 : 0;
  return props.data.map((d) => {
    const fraction = d.value / total;
    const length = Math.max(fraction * circumference - gap, 0);
    const offset = -((cumulative / total) * circumference);
    cumulative += d.value;
    return { key: d.key, color: d.color, length, offset };
  });
});
</script>

<style scoped>
.donut {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 8px auto 24px;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.donut-label {
  font-size: 12px;
  letter-spacing: 0.5px;
  font-weight: 600;
  color: var(--by-text-muted);
  text-transform: uppercase;
}

.donut-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--by-text);
}
</style>
