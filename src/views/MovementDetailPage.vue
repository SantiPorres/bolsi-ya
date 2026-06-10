<template>
  <ion-page>
    <ion-header :translucent="false">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/history" text="" />
        </ion-buttons>
        <ion-title>Detalle</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="movement" class="detail">
        <div class="amount-block">
          <span class="amount-caption">Monto de la transacción</span>
          <h1 class="amount" :class="movement.type">
            {{ formatSigned(movement.amount, movement.type, true) }}
          </h1>
          <span class="status-pill">
            <span class="dot" /> {{ movement.type === 'income' ? 'Ingreso' : 'Gasto' }}
          </span>
        </div>

        <div class="info-card">
          <div class="info-row">
            <span class="info-icon" :style="{ backgroundColor: tint }">
              <ion-icon :icon="categoryIcon" :style="{ color: category?.color }" />
            </span>
            <div class="info-text">
              <span class="info-label">Categoría</span>
              <span class="info-value">{{ category?.name ?? 'Sin categoría' }}</span>
            </div>
          </div>
          <div class="divider" />
          <div class="info-row">
            <span class="info-icon neutral"><ion-icon :icon="calendarOutline" /></span>
            <div class="info-text">
              <span class="info-label">Fecha y hora</span>
              <span class="info-value">{{ formatLongDate(movement.date) }}</span>
            </div>
          </div>
          <template v-if="movement.description">
            <div class="divider" />
            <div class="info-row">
              <span class="info-icon neutral"><ion-icon :icon="documentTextOutline" /></span>
              <div class="info-text">
                <span class="info-label">Descripción</span>
                <span class="info-value">{{ movement.description }}</span>
              </div>
            </div>
          </template>
        </div>

        <button class="action edit" type="button" @click="router.push(`/tabs/movement/${movement.id}/edit`)">
          <ion-icon :icon="createOutline" /> Editar
        </button>
        <button class="action delete" type="button" @click="confirmDelete">
          <ion-icon :icon="trashOutline" /> Eliminar
        </button>
      </div>

      <p v-else class="empty">Movimiento no encontrado.</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  alertController,
} from '@ionic/vue';
import * as ionicons from 'ionicons/icons';
import { calendarOutline, documentTextOutline, createOutline, trashOutline } from 'ionicons/icons';
import { useFinance } from '@/composables/useFinance';
import { formatSigned, formatLongDate } from '@/utils/format';

const route = useRoute();
const router = useRouter();
const { getMovement, getCategory, deleteMovement } = useFinance();

const movement = computed(() => getMovement(route.params.id as string));
const category = computed(() => (movement.value ? getCategory(movement.value.categoryId) : undefined));
const tint = computed(() => `${category.value?.color ?? '#9aa0ab'}22`);

const categoryIcon = computed(() => {
  const map = ionicons as Record<string, string>;
  const name = category.value?.icon ?? 'ellipsis-horizontal';
  const key = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return map[key] ?? map.ellipsisHorizontal;
});

async function confirmDelete() {
  if (!movement.value) return;
  const alert = await alertController.create({
    header: 'Eliminar movimiento',
    message: '¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: () => {
          deleteMovement(movement.value!.id);
          router.replace('/tabs/history');
        },
      },
    ],
  });
  await alert.present();
}
</script>

<style scoped>
ion-toolbar {
  --background: var(--by-bg);
  --border-width: 0;
}

ion-title {
  font-weight: 700;
}

.detail {
  padding: 8px 20px 28px;
}

.amount-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 0 24px;
}

.amount-caption {
  font-size: 12px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--by-text-muted);
}

.amount {
  font-size: 38px;
  font-weight: 700;
  margin: 0;
}

.amount.income {
  color: var(--by-green);
}

.amount.expense {
  color: var(--by-text);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--by-text-muted);
  background: #e8eaf0;
  padding: 5px 12px;
  border-radius: 999px;
}

.status-pill .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--by-text-muted);
}

.info-card {
  background: var(--by-surface);
  border-radius: 20px;
  box-shadow: var(--by-shadow);
  padding: 6px 18px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
}

.info-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.info-icon.neutral {
  background: #eef1f6;
  color: var(--by-text-muted);
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-label {
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--by-text-muted);
}

.info-value {
  font-size: 16px;
  color: var(--by-text);
}

.divider {
  height: 1px;
  background: var(--by-border);
}

.action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}

.action.edit {
  background: var(--by-surface);
  border: 1px solid var(--by-text);
  color: var(--by-text);
}

.action.delete {
  background: var(--by-red-soft);
  border: none;
  color: var(--by-red);
}

.empty {
  text-align: center;
  color: var(--by-text-muted);
  padding: 40px 0;
}
</style>
