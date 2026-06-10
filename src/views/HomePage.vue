<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <div class="home">
        <section class="balance-card">
          <span class="balance-label">Balance Actual</span>
          <h1 class="balance-value">{{ formatCurrency(summary.balance) }}</h1>
          <span v-if="change !== null" class="balance-change" :class="{ negative: change < 0 }">
            <ion-icon :icon="change < 0 ? trendingDownOutline : trendingUpOutline" />
            {{ change >= 0 ? '+' : '' }}{{ change.toFixed(1) }}% este mes
          </span>
        </section>

        <section class="totals">
          <div class="total-card">
            <span class="total-head">
              <ion-icon :icon="arrowDownOutline" class="ic-income" /> Ingresos
            </span>
            <span class="total-amount income">+{{ formatCurrency(summary.income) }}</span>
          </div>
          <div class="total-card">
            <span class="total-head">
              <ion-icon :icon="arrowUpOutline" class="ic-expense" /> Gastos
            </span>
            <span class="total-amount expense">-{{ formatCurrency(summary.expense) }}</span>
          </div>
        </section>

        <button class="primary-btn" type="button" @click="router.push('/tabs/register')">
          <ion-icon :icon="addCircle" />
          Nuevo Movimiento
        </button>

        <section class="recent">
          <div class="recent-head">
            <h2>Transacciones recientes</h2>
            <button type="button" class="see-all" @click="router.push('/tabs/history')">VER TODO</button>
          </div>

          <div v-if="recent.length" class="recent-list">
            <TransactionItem
              v-for="m in recent"
              :key="m.id"
              :movement="m"
              @select="router.push(`/tabs/movement/${m.id}`)"
            />
          </div>
          <p v-else class="empty">Aún no hay movimientos registrados.</p>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import {
  addCircle,
  arrowDownOutline,
  arrowUpOutline,
  trendingUpOutline,
  trendingDownOutline,
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import TransactionItem from '@/components/TransactionItem.vue';
import { useFinance } from '@/composables/useFinance';
import { formatCurrency } from '@/utils/format';

const router = useRouter();
const { monthlySummary, monthlyChangePercent, recentMovements } = useFinance();

const summary = computed(() => monthlySummary());
const change = computed(() => monthlyChangePercent());
const recent = computed(() => recentMovements(4));
</script>

<style scoped>
.home {
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.balance-card {
  background: var(--by-dark);
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #ffffff;
}

.balance-label {
  font-size: 12px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

.balance-value {
  font-size: 34px;
  font-weight: 700;
  margin: 0;
}

.balance-change {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--by-green-soft);
  background: rgba(21, 184, 129, 0.12);
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
}

.balance-change.negative {
  color: #ff8a8a;
  background: rgba(229, 72, 77, 0.15);
}

.totals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.total-card {
  background: var(--by-surface);
  border-radius: var(--by-radius);
  box-shadow: var(--by-shadow);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.total-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--by-text-muted);
}

.ic-income {
  color: var(--by-green);
}

.ic-expense {
  color: var(--by-red);
}

.total-amount {
  font-size: 19px;
  font-weight: 700;
}

.total-amount.income {
  color: var(--by-green);
}

.total-amount.expense {
  color: var(--by-red);
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: var(--by-black);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn ion-icon {
  font-size: 20px;
}

.recent-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.recent-head h2 {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
}

.see-all {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: var(--by-text-muted);
  cursor: pointer;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty {
  text-align: center;
  color: var(--by-text-muted);
  font-size: 14px;
  padding: 24px 0;
}
</style>
