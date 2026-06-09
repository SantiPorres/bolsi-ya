<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- Filters -->
      <div class="filters ion-padding-horizontal">
        <div class="filter-tabs">
          <button
            v-for="f in filterOptions"
            :key="f.value"
            :class="['filter-tab', { active: activeFilter === f.value }]"
            @click="activeFilter = f.value"
          >
            {{ f.label }}
          </button>
        </div>
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M8.5 3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM17 17l-3.5-3.5" stroke="#888" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input v-model="searchQuery" placeholder="Buscar..." class="search-input" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filtered.length === 0" class="empty-state">
        <p class="empty-icon">🔍</p>
        <p class="empty-text">Sin resultados</p>
        <p class="empty-sub">Prueba con otro filtro o búsqueda.</p>
      </div>

      <!-- Grouped by date -->
      <div v-else class="tx-groups ion-padding-horizontal">
        <div v-for="group in groupedByDate" :key="group.date" class="tx-group">
          <div class="group-header">
            <span class="group-date">{{ group.label }}</span>
            <span class="group-total" :class="group.net >= 0 ? 'income' : 'expense'">
              {{ group.net >= 0 ? '+' : '−' }}{{ formatCurrency(Math.abs(group.net)) }}
            </span>
          </div>
          <div
            v-for="tx in group.transactions"
            :key="tx.id"
            class="tx-item"
            @click="openActionSheet(tx)"
          >
            <div class="tx-icon" :style="{ background: getCategoryColor(tx.categoryId) + '22' }">
              <span>{{ getCategoryIcon(tx.categoryId) }}</span>
            </div>
            <div class="tx-info">
              <p class="tx-category">{{ getCategoryName(tx.categoryId) }}</p>
              <p v-if="tx.note" class="tx-note">{{ tx.note }}</p>
            </div>
            <span :class="['tx-amount', tx.type]">
              {{ tx.type === 'income' ? '+' : '−' }}{{ formatCurrency(tx.amount) }}
            </span>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- FAB -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button color="success" @click="openAddModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonPage, IonContent, IonFab, IonFabButton, modalController, actionSheetController } from '@ionic/vue'
import { useFinanceStore } from '@/stores/finance'
import AddTransactionModal from '@/components/AddTransactionModal.vue'
import type { Transaction } from '@/types'

const store = useFinanceStore()
const activeFilter = ref<'all' | 'income' | 'expense'>('all')
const searchQuery = ref('')

const filterOptions = [
  { label: 'Todo', value: 'all' as const },
  { label: 'Ingresos', value: 'income' as const },
  { label: 'Gastos', value: 'expense' as const },
]

const filtered = computed(() => {
  let txs = [...store.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  if (activeFilter.value !== 'all') txs = txs.filter(t => t.type === activeFilter.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    txs = txs.filter(t =>
      t.note.toLowerCase().includes(q) ||
      getCategoryName(t.categoryId).toLowerCase().includes(q)
    )
  }
  return txs
})

const groupedByDate = computed(() => {
  const map = new Map<string, Transaction[]>()
  filtered.value.forEach(tx => {
    const key = tx.date.split('T')[0]
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(tx)
  })
  return [...map.entries()].map(([date, txs]) => ({
    date,
    label: formatGroupDate(date),
    transactions: txs,
    net: txs.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0),
  }))
})

function formatGroupDate(date: string) {
  const d = new Date(date + 'T12:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

function getCategoryIcon(id: string) { return store.getCategoryById(id)?.icon ?? '📋' }
function getCategoryName(id: string) { return store.getCategoryById(id)?.name ?? 'Sin categoría' }
function getCategoryColor(id: string) { return store.getCategoryById(id)?.color ?? '#ccc' }

async function openAddModal() {
  const modal = await modalController.create({
    component: AddTransactionModal,
    initialBreakpoint: 0.95,
    breakpoints: [0, 0.95],
    handle: true,
  })
  await modal.present()
}

async function openActionSheet(tx: Transaction) {
  const sheet = await actionSheetController.create({
    header: `${getCategoryIcon(tx.categoryId)} ${getCategoryName(tx.categoryId)}`,
    buttons: [
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: () => store.deleteTransaction(tx.id),
      },
      { text: 'Cancelar', role: 'cancel' },
    ],
  })
  await sheet.present()
}
</script>

<style scoped>
.filters {
  padding-top: 16px;
  padding-bottom: 8px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-tab {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid #e0e0e0;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-tab.active {
  background: #006C49;
  border-color: #006C49;
  color: white;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 10px 14px;
}

.search-input {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  width: 100%;
  outline: none;
}

.empty-state {
  text-align: center;
  padding: 64px 0;
}

.empty-icon { font-size: 48px; margin-bottom: 8px; }
.empty-text { font-size: 16px; font-weight: 600; color: #333; margin: 0; }
.empty-sub { font-size: 13px; color: #888; margin: 4px 0 0; }

.tx-groups {
  padding-bottom: 80px;
}

.tx-group {
  margin-bottom: 8px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 6px;
}

.group-date {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-total {
  font-size: 13px;
  font-weight: 600;
}

.group-total.income { color: #006C49; }
.group-total.expense { color: #CC3333; }

.tx-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.tx-item:last-child { border-bottom: none; }

.tx-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.tx-info { flex: 1; min-width: 0; }
.tx-category { font-size: 14px; font-weight: 600; color: #111; margin: 0; }
.tx-note { font-size: 12px; color: #888; margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.tx-amount { font-size: 15px; font-weight: 600; flex-shrink: 0; }
.tx-amount.income { color: #006C49; }
.tx-amount.expense { color: #CC3333; }

ion-fab-button {
  --background: #006C49;
  --background-activated: #005038;
}
</style>
