<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">

      <!-- No data state -->
      <div v-if="store.currentMonthTransactions.length === 0" class="empty-state">
        <p class="empty-icon">📊</p>
        <p class="empty-text">Aún no hay datos este mes.</p>
        <p class="empty-sub">Agrega ingresos y gastos para ver tus gráficos.</p>
      </div>

      <template v-else>
        <!-- Income vs Expenses bar chart (last 6 months) -->
        <div class="card">
          <h3 class="card-title">Ingresos vs Gastos</h3>
          <p class="card-sub">Últimos 6 meses</p>
          <div class="bar-chart">
            <div v-for="month in store.lastSixMonthsData" :key="month.label" class="bar-group">
              <div class="bars">
                <div
                  class="bar income-bar"
                  :style="{ height: barHeight(month.income) + 'px' }"
                  :title="formatCurrency(month.income)"
                ></div>
                <div
                  class="bar expense-bar"
                  :style="{ height: barHeight(month.expenses) + 'px' }"
                  :title="formatCurrency(month.expenses)"
                ></div>
              </div>
              <span class="bar-label">{{ month.label }}</span>
            </div>
          </div>
          <div class="chart-legend">
            <span class="legend-dot income-dot"></span><span class="legend-text">Ingresos</span>
            <span class="legend-dot expense-dot"></span><span class="legend-text">Gastos</span>
          </div>
        </div>

        <!-- Expense by category donut chart -->
        <div v-if="store.expensesByCategory.length > 0" class="card">
          <h3 class="card-title">Gastos por categoría</h3>
          <p class="card-sub">Mes actual</p>

          <div class="donut-container">
            <svg viewBox="0 0 120 120" class="donut-svg">
              <template v-for="(seg, i) in donutSegments" :key="i">
                <circle
                  cx="60" cy="60" r="46"
                  fill="transparent"
                  :stroke="seg.color"
                  stroke-width="18"
                  :stroke-dasharray="seg.dasharray"
                  :stroke-dashoffset="seg.offset"
                  stroke-linecap="butt"
                />
              </template>
              <text x="60" y="56" text-anchor="middle" font-size="11" fill="#333" font-weight="600">
                Total
              </text>
              <text x="60" y="70" text-anchor="middle" font-size="9" fill="#666">
                {{ formatCurrencyShort(store.totalExpenses) }}
              </text>
            </svg>
          </div>

          <div class="cat-breakdown">
            <div
              v-for="item in store.expensesByCategory"
              :key="item.category!.id"
              class="cat-row"
            >
              <div class="cat-left">
                <span class="cat-icon-sm">{{ item.category!.icon }}</span>
                <span class="cat-name-sm">{{ item.category!.name }}</span>
              </div>
              <div class="cat-right">
                <div class="cat-bar-wrap">
                  <div
                    class="cat-bar-fill"
                    :style="{
                      width: pct(item.total) + '%',
                      background: item.category!.color
                    }"
                  ></div>
                </div>
                <span class="cat-pct">{{ pct(item.total) }}%</span>
                <span class="cat-total">{{ formatCurrency(item.total) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly summary -->
        <div class="card summary-card">
          <h3 class="card-title">Resumen del mes</h3>
          <div class="summary-row">
            <span class="summary-label">Total ingresos</span>
            <span class="summary-value income">+{{ formatCurrency(store.totalIncome) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Total gastos</span>
            <span class="summary-value expense">-{{ formatCurrency(store.totalExpenses) }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row">
            <span class="summary-label bold">Balance neto</span>
            <span class="summary-value bold" :class="store.balance >= 0 ? 'income' : 'expense'">
              {{ store.balance >= 0 ? '+' : '−' }}{{ formatCurrency(Math.abs(store.balance)) }}
            </span>
          </div>
          <div class="savings-rate" v-if="store.totalIncome > 0">
            <span>Tasa de ahorro: </span>
            <strong>{{ savingsRate }}%</strong>
          </div>
        </div>
      </template>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { useFinanceStore } from '@/stores/finance'

const store = useFinanceStore()

const MAX_BAR_HEIGHT = 80

const maxBarValue = computed(() => {
  const vals = store.lastSixMonthsData.flatMap(m => [m.income, m.expenses])
  return Math.max(...vals, 1)
})

function barHeight(val: number) {
  return Math.max(4, (val / maxBarValue.value) * MAX_BAR_HEIGHT)
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

function formatCurrencyShort(amount: number) {
  if (amount >= 1_000_000) return '$' + (amount / 1_000_000).toFixed(1) + 'M'
  if (amount >= 1_000) return '$' + (amount / 1_000).toFixed(0) + 'k'
  return '$' + amount
}

function pct(val: number) {
  return store.totalExpenses > 0 ? Math.round((val / store.totalExpenses) * 100) : 0
}

const savingsRate = computed(() => {
  if (store.totalIncome === 0) return 0
  return Math.round((store.balance / store.totalIncome) * 100)
})

const CIRCUMFERENCE = 2 * Math.PI * 46 // r=46

const donutSegments = computed(() => {
  const total = store.totalExpenses
  if (total === 0) return []
  let offset = CIRCUMFERENCE * 0.25 // start at top
  return store.expensesByCategory.map(item => {
    const fraction = item.total / total
    const dash = fraction * CIRCUMFERENCE
    const seg = {
      color: item.category!.color,
      dasharray: `${dash} ${CIRCUMFERENCE - dash}`,
      offset: -offset + CIRCUMFERENCE,
    }
    offset += dash
    return seg
  })
})
</script>

<style scoped>
.empty-state { text-align: center; padding: 80px 0; }
.empty-icon { font-size: 48px; margin-bottom: 8px; }
.empty-text { font-size: 16px; font-weight: 600; color: #333; margin: 0; }
.empty-sub { font-size: 13px; color: #888; margin: 4px 0 0; }

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111;
  margin: 0 0 2px;
}

.card-sub {
  font-size: 12px;
  color: #888;
  margin: 0 0 16px;
}

/* Bar chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 96px;
  gap: 4px;
  margin-bottom: 8px;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 80px;
}

.bar {
  width: 10px;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.4s ease;
}

.income-bar { background: #006C49; }
.expense-bar { background: #FF6B6B; }

.bar-label {
  font-size: 10px;
  color: #888;
  text-transform: capitalize;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.income-dot { background: #006C49; }
.expense-dot { background: #FF6B6B; }

.legend-text { font-size: 12px; color: #555; }

/* Donut */
.donut-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.donut-svg {
  width: 160px;
  height: 160px;
  transform: rotate(-90deg);
}

.donut-svg text { transform: rotate(90deg); transform-origin: 60px 60px; }

/* Category breakdown */
.cat-breakdown { display: flex; flex-direction: column; gap: 10px; }

.cat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cat-left { display: flex; align-items: center; gap: 8px; flex-shrink: 0; width: 110px; }
.cat-icon-sm { font-size: 16px; }
.cat-name-sm { font-size: 13px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.cat-right { display: flex; align-items: center; gap: 8px; flex: 1; }

.cat-bar-wrap { flex: 1; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.cat-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }

.cat-pct { font-size: 12px; color: #888; width: 30px; text-align: right; }
.cat-total { font-size: 12px; font-weight: 600; color: #333; width: 72px; text-align: right; }

/* Summary */
.summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
.summary-label { font-size: 14px; color: #555; }
.summary-label.bold { font-weight: 700; color: #111; }
.summary-value { font-size: 14px; font-weight: 600; }
.summary-value.bold { font-size: 16px; }
.summary-value.income { color: #006C49; }
.summary-value.expense { color: #CC3333; }
.summary-divider { height: 1px; background: #f0f0f0; margin: 4px 0; }

.savings-rate {
  margin-top: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #555;
  text-align: center;
}

.savings-rate strong { color: #006C49; }
</style>
