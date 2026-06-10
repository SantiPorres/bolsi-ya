<template>
  <button class="tx" type="button" @click="$emit('select')">
    <span class="tx-icon" :style="{ backgroundColor: tint }">
      <ion-icon :icon="iconFor(category?.icon)" :style="{ color: category?.color }" />
    </span>
    <span class="tx-body">
      <span class="tx-title">{{ title }}</span>
      <span class="tx-meta">{{ subtitle }}</span>
    </span>
    <span class="tx-amount" :class="movement.type">
      {{ formatSigned(movement.amount, movement.type) }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import * as icons from 'ionicons/icons';
import { Movement } from '@/types';
import { useFinance } from '@/composables/useFinance';
import { formatSigned, formatTime } from '@/utils/format';

const props = defineProps<{ movement: Movement }>();
defineEmits<{ select: [] }>();

const { getCategory } = useFinance();
const category = computed(() => getCategory(props.movement.categoryId));

const title = computed(() => props.movement.description || category.value?.name || 'Movimiento');
const subtitle = computed(() => `${category.value?.name ?? 'Sin categoría'} • ${formatTime(props.movement.date)}`);
const tint = computed(() => `${category.value?.color ?? '#9aa0ab'}22`);

function iconFor(name?: string) {
  const map = icons as Record<string, string>;
  const key = (name ?? 'ellipsis-horizontal').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return map[key] ?? map.ellipsisHorizontal;
}
</script>

<style scoped>
.tx {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px;
  background: var(--by-surface);
  border: none;
  border-radius: var(--by-radius);
  box-shadow: var(--by-shadow);
  text-align: left;
  cursor: pointer;
}

.tx-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.tx-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.tx-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--by-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-meta {
  font-size: 13px;
  color: var(--by-text-muted);
}

.tx-amount {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.tx-amount.income {
  color: var(--by-green);
}

.tx-amount.expense {
  color: var(--by-red);
}
</style>
