<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- Balance Card -->
      <div class="balance-card">
        <p class="balance-label">Balance del mes</p>
        <h1 class="balance-amount" :class="{ negative: store.balance < 0 }">
          {{ formatCurrency(store.balance) }}
        </h1>
        <div class="balance-row">
          <div class="balance-item income">
            <span class="bi-label">Ingresos</span>
            <span class="bi-value">+{{ formatCurrency(store.totalIncome) }}</span>
          </div>
          <div class="divider-v"></div>
          <div class="balance-item expense">
            <span class="bi-label">Gastos</span>
            <span class="bi-value">-{{ formatCurrency(store.totalExpenses) }}</span>
          </div>
        </div>
      </div>

      <!-- Quick add buttons -->
      <div class="quick-actions ion-padding-horizontal">
        <button class="quick-btn expense-btn" @click="openModal('expense')">
          <span class="quick-icon">−</span>
          <span>Gasto</span>
        </button>
        <button class="quick-btn income-btn" @click="openModal('income')">
          <span class="quick-icon">+</span>
          <span>Ingreso</span>
        </button>
      </div>

      <!-- Recent transactions -->
      <div class="section ion-padding-horizontal">
        <div class="section-header">
          <h2 class="section-title">Últimos movimientos</h2>
          <router-link to="/tabs/history" class="see-all">Ver todo</router-link>
        </div>

        <div v-if="store.recentTransactions.length === 0" class="empty-state">
          <p class="empty-icon">💸</p>
          <p class="empty-text">Aún no hay movimientos.</p>
          <p class="empty-sub">Añade tu primer ingreso o gasto.</p>
        </div>

        <div v-else class="tx-list">
          <div
            v-for="tx in store.recentTransactions.slice(0, 8)"
            :key="tx.id"
            class="tx-item"
          >
            <div class="tx-icon" :style="{ background: getCategoryColor(tx.categoryId) + '22' }">
              <span>{{ getCategoryIcon(tx.categoryId) }}</span>
            </div>
            <div class="tx-info">
              <p class="tx-category">{{ getCategoryName(tx.categoryId) }}</p>
              <p class="tx-note">{{ tx.note || formatDate(tx.date) }}</p>
            </div>
            <span :class="['tx-amount', tx.type]">
              {{ tx.type === 'income' ? '+' : '−' }}{{ formatCurrency(tx.amount) }}
            </span>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, modalController } from '@ionic/vue'
import { useFinanceStore } from '@/stores/finance'
import AddTransactionModal from '@/components/AddTransactionModal.vue'
import type { TransactionType } from '@/types'

const store = useFinanceStore()

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Math.abs(amount))
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function getCategoryIcon(id: string) {
  return store.getCategoryById(id)?.icon ?? '📋'
}

function getCategoryName(id: string) {
  return store.getCategoryById(id)?.name ?? 'Sin categoría'
}

function getCategoryColor(id: string) {
  return store.getCategoryById(id)?.color ?? '#ccc'
}

async function openModal(defaultType: TransactionType) {
  const modal = await modalController.create({
    component: AddTransactionModal,
    componentProps: { defaultType },
    initialBreakpoint: 0.95,
    breakpoints: [0, 0.95],
    handle: true,
  })
  await modal.present()
}
</script>

<style scoped>
.balance-card {
  background: linear-gradient(135deg, #006C49 0%, #00945f 100%);
  padding: 36px 24px 28px;
  color: white;
}

.balance-label {
  font-size: 13px;
  opacity: 0.8;
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.balance-amount {
  font-size: 44px;
  font-weight: 700;
  margin: 0 0 20px;
  letter-spacing: -1px;
}

.balance-amount.negative {
  color: #ffb3b3;
}

.balance-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.balance-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bi-label {
  font-size: 12px;
  opacity: 0.75;
}

.bi-value {
  font-size: 16px;
  font-weight: 600;
}

.balance-item.expense .bi-value {
  color: #ffb3b3;
}

.divider-v {
  width: 1px;
  height: 32px;
  background: rgba(255,255,255,0.3);
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin: 20px 0 4px;
}

.quick-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.expense-btn {
  background: #FF6B6B18;
  color: #CC3333;
}

.income-btn {
  background: #006C4918;
  color: #006C49;
}

.quick-icon {
  font-size: 22px;
  line-height: 1;
  font-weight: 300;
}

.section {
  margin-top: 24px;
  padding-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.see-all {
  font-size: 13px;
  color: #006C49;
  text-decoration: none;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.empty-sub {
  font-size: 13px;
  color: #888;
  margin: 4px 0 0;
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.tx-item:last-child {
  border-bottom: none;
}

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

.tx-info {
  flex: 1;
  min-width: 0;
}

.tx-category {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin: 0;
}

.tx-note {
  font-size: 12px;
  color: #888;
  margin: 2px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-amount {
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}

.tx-amount.income {
  color: #006C49;
}

.tx-amount.expense {
  color: #CC3333;
}
</style>
