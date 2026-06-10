<template>
  <div class="bars">
    <div v-for="bar in bars" :key="bar.label" class="bar-row">
      <div class="bar-track">
        <div
          class="bar-fill"
          :style="{ height: `${bar.height}%`, backgroundColor: bar.color }"
        />
      </div>
      <span class="bar-value" :style="{ color: bar.color }">{{ bar.display }}</span>
      <span class="bar-label">{{ bar.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/utils/format';

const props = defineProps<{
  data: { label: string; value: number; color: string }[];
}>();

const bars = computed(() => {
  const max = Math.max(...props.data.map((d) => d.value), 1);
  return props.data.map((d) => ({
    ...d,
    height: (d.value / max) * 100,
    display: formatCurrency(d.value),
  }));
});
</script>

<style scoped>
.bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 24px;
  height: 240px;
  padding: 16px 8px 0;
}

.bar-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  flex: 1;
  max-width: 96px;
}

.bar-track {
  flex: 1;
  width: 56px;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  border-radius: 12px 12px 4px 4px;
  min-height: 6px;
  transition: height 0.3s ease;
}

.bar-value {
  font-size: 14px;
  font-weight: 700;
}

.bar-label {
  font-size: 13px;
  color: var(--by-text-muted);
}
</style>
