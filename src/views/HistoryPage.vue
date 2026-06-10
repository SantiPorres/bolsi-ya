<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <h1 class="by-screen-title">Historial de Movimientos</h1>

      <div class="filters">
        <button
          type="button"
          class="chip"
          :class="{ active: filters.type !== 'all' }"
          :id="typeTrigger"
        >
          {{ typeLabel }} <ion-icon :icon="chevronDown" />
        </button>
        <button
          type="button"
          class="chip"
          :class="{ active: filters.categoryId !== 'all' }"
          :id="categoryTrigger"
        >
          {{ categoryLabel }} <ion-icon :icon="chevronDown" />
        </button>
        <button
          type="button"
          class="chip"
          :class="{ active: hasDateRange }"
          @click="dateModalOpen = true"
        >
          {{ dateLabel }} <ion-icon :icon="chevronDown" />
        </button>
        <button type="button" class="chip chip-icon" @click="reset">
          <ion-icon :icon="options" />
        </button>
      </div>

      <ion-popover :trigger="typeTrigger" :dismiss-on-select="true" side="bottom" alignment="start">
        <ion-content>
          <ion-list lines="none">
            <ion-item v-for="opt in typeOptions" :key="opt.value" button @click="filters.type = opt.value">
              <ion-label>{{ opt.label }}</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>

      <ion-popover :trigger="categoryTrigger" :dismiss-on-select="true" side="bottom" alignment="start">
        <ion-content>
          <ion-list lines="none">
            <ion-item button @click="filters.categoryId = 'all'">
              <ion-label>Todas</ion-label>
            </ion-item>
            <ion-item v-for="c in categories" :key="c.id" button @click="filters.categoryId = c.id">
              <ion-label>{{ c.name }}</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>

      <ion-modal :is-open="dateModalOpen" @did-dismiss="dateModalOpen = false">
        <div class="date-modal">
          <h2>Rango de fechas</h2>
          <label>Desde</label>
          <ion-datetime v-model="draftFrom" presentation="date" />
          <label>Hasta</label>
          <ion-datetime v-model="draftTo" presentation="date" />
          <div class="date-actions">
            <button type="button" class="ghost" @click="clearDates">Limpiar</button>
            <button type="button" class="solid" @click="applyDates">Aplicar</button>
          </div>
        </div>
      </ion-modal>

      <div class="list">
        <template v-if="groups.length">
          <div v-for="group in groups" :key="group.label" class="group">
            <h3 class="group-label">{{ group.label }}</h3>
            <div class="group-items">
              <TransactionItem
                v-for="m in group.items"
                :key="m.id"
                :movement="m"
                @select="router.push(`/tabs/movement/${m.id}`)"
              />
            </div>
          </div>
        </template>
        <p v-else class="empty">No hay movimientos para los filtros seleccionados.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
  IonDatetime,
} from '@ionic/vue';
import { chevronDown, options } from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import TransactionItem from '@/components/TransactionItem.vue';
import { useFinance } from '@/composables/useFinance';
import { HistoryFilters } from '@/types';
import { relativeDayLabel } from '@/utils/format';

const router = useRouter();
const { categories, filteredMovements } = useFinance();

const typeTrigger = 'history-type-trigger';
const categoryTrigger = 'history-category-trigger';

const filters = reactive<HistoryFilters>({ type: 'all', categoryId: 'all', from: null, to: null });

const dateModalOpen = ref(false);
const draftFrom = ref<string | null>(null);
const draftTo = ref<string | null>(null);

const typeOptions: { value: HistoryFilters['type']; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Gastos' },
];

const typeLabel = computed(() => {
  if (filters.type === 'all') return 'Tipo';
  return filters.type === 'income' ? 'Ingresos' : 'Gastos';
});

const categoryLabel = computed(() => {
  if (filters.categoryId === 'all') return 'Categoría';
  return categories.value.find((c) => c.id === filters.categoryId)?.name ?? 'Categoría';
});

const hasDateRange = computed(() => filters.from !== null || filters.to !== null);
const dateLabel = computed(() => (hasDateRange.value ? 'Fechas ✓' : 'Rango de fechas'));

const groups = computed(() => {
  const items = filteredMovements(filters);
  const map = new Map<string, typeof items>();
  for (const m of items) {
    const label = relativeDayLabel(m.date);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(m);
  }
  return [...map.entries()].map(([label, list]) => ({ label, items: list }));
});

function applyDates() {
  filters.from = draftFrom.value ? new Date(draftFrom.value).toISOString() : null;
  if (draftTo.value) {
    const end = new Date(draftTo.value);
    end.setHours(23, 59, 59, 999);
    filters.to = end.toISOString();
  } else {
    filters.to = null;
  }
  dateModalOpen.value = false;
}

function clearDates() {
  draftFrom.value = null;
  draftTo.value = null;
  filters.from = null;
  filters.to = null;
  dateModalOpen.value = false;
}

function reset() {
  filters.type = 'all';
  filters.categoryId = 'all';
  clearDates();
}

</script>

<style scoped>
.filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 20px 16px;
  scrollbar-width: none;
}

.filters::-webkit-scrollbar {
  display: none;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  padding: 8px 14px;
  border: 1px solid var(--by-border);
  border-radius: 999px;
  background: var(--by-surface);
  font-size: 14px;
  color: var(--by-text);
  cursor: pointer;
}

.chip.active {
  border-color: var(--by-green);
  color: var(--by-green);
  background: rgba(0, 135, 90, 0.06);
}

.chip ion-icon {
  font-size: 14px;
}

.chip-icon {
  padding: 8px 10px;
}

.list {
  padding: 0 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.group-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--by-text-muted);
  margin: 0 0 10px;
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty {
  text-align: center;
  color: var(--by-text-muted);
  font-size: 14px;
  padding: 32px 0;
}

.date-modal {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-modal h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
}

.date-modal label {
  font-size: 13px;
  color: var(--by-text-muted);
  margin-top: 8px;
}

.date-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.date-actions button {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.ghost {
  border: 1px solid var(--by-border);
  background: var(--by-surface);
  color: var(--by-text);
}

.solid {
  border: none;
  background: var(--by-black);
  color: #ffffff;
}
</style>
