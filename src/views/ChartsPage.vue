<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <h1 class="by-screen-title">Análisis</h1>

      <div class="seg">
        <button type="button" :class="{ active: mode === 'expense' }" @click="mode = 'expense'">
          <ion-icon :icon="pieChartOutline" /> Gastos por Categoría
        </button>
        <button type="button" :class="{ active: mode === 'compare' }" @click="mode = 'compare'">
          <ion-icon :icon="barChartOutline" /> Ingresos vs Gastos
        </button>
      </div>

      <div class="panel">
        <template v-if="mode === 'expense'">
          <template v-if="expenses.total > 0">
            <DonutChart
              :data="expenses.slices.map((s) => ({ key: s.categoryId, value: s.amount, color: s.color }))"
              label="Total Gastos"
              :value="formatCurrency(expenses.total)"
            />
            <ul class="legend">
              <li v-for="s in expenses.slices" :key="s.categoryId">
                <span class="legend-dot" :style="{ backgroundColor: s.color }" />
                <span class="legend-name">{{ s.name }}</span>
                <span class="legend-pct">{{ s.percent.toFixed(0) }}%</span>
                <span class="legend-amount">{{ formatCurrency(s.amount) }}</span>
              </li>
            </ul>
          </template>
          <p v-else class="empty">No hay gastos registrados este mes.</p>
        </template>

        <template v-else>
          <template v-if="summary.income > 0 || summary.expense > 0">
            <BarChart
              :data="[
                { label: 'Ingresos', value: summary.income, color: 'var(--by-green)' },
                { label: 'Gastos', value: summary.expense, color: 'var(--by-red)' },
              ]"
            />
            <div class="balance-row">
              <span>Balance del mes</span>
              <strong :class="summary.balance >= 0 ? 'pos' : 'neg'">
                {{ summary.balance >= 0 ? '+' : '-' }}{{ formatCurrency(summary.balance) }}
              </strong>
            </div>
          </template>
          <p v-else class="empty">No hay movimientos registrados este mes.</p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { pieChartOutline, barChartOutline } from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import DonutChart from '@/components/DonutChart.vue';
import BarChart from '@/components/BarChart.vue';
import { useFinance } from '@/composables/useFinance';
import { formatCurrency } from '@/utils/format';

const { expenseByCategory, monthlySummary } = useFinance();

const mode = ref<'expense' | 'compare'>('expense');
const expenses = computed(() => expenseByCategory());
const summary = computed(() => monthlySummary());
</script>

<style scoped>
.seg {
  display: flex;
  gap: 8px;
  background: #e8eaf0;
  border-radius: 12px;
  padding: 4px;
  margin: 8px 20px 16px;
}

.seg button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: none;
  border-radius: 9px;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--by-text-muted);
  cursor: pointer;
}

.seg button.active {
  background: var(--by-surface);
  color: var(--by-text);
  box-shadow: var(--by-shadow);
}

.panel {
  margin: 0 20px;
  background: var(--by-surface);
  border-radius: 20px;
  box-shadow: var(--by-shadow);
  padding: 22px 18px;
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  color: var(--by-text);
}

.legend-pct {
  color: var(--by-text-muted);
  width: 44px;
  text-align: right;
}

.legend-amount {
  font-weight: 600;
  width: 96px;
  text-align: right;
}

.balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--by-border);
  font-size: 15px;
  color: var(--by-text-muted);
}

.balance-row .pos {
  color: var(--by-green);
  font-size: 18px;
}

.balance-row .neg {
  color: var(--by-red);
  font-size: 18px;
}

.empty {
  text-align: center;
  color: var(--by-text-muted);
  font-size: 14px;
  padding: 40px 0;
}
</style>
