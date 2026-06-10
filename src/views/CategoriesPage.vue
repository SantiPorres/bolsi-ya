<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <h1 class="by-screen-title">Categorías</h1>
      <p class="by-screen-subtitle">Gestiona cómo clasificas tus transacciones.</p>

      <div class="cat-list">
        <div v-for="c in categories" :key="c.id" class="cat-card">
          <span class="cat-icon" :style="{ backgroundColor: `${c.color}22` }">
            <ion-icon :icon="iconFor(c.icon)" :style="{ color: c.color }" />
          </span>
          <div class="cat-text">
            <span class="cat-name">{{ c.name }}</span>
            <span class="cat-type" :class="c.type">{{ c.type === 'income' ? 'Ingreso' : 'Gasto' }}</span>
          </div>
          <button type="button" class="cat-action" @click="openEdit(c)">
            <ion-icon :icon="createOutline" />
          </button>
          <button type="button" class="cat-action" @click="confirmDelete(c)">
            <ion-icon :icon="trashOutline" />
          </button>
        </div>
      </div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="openCreate">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <CategoryFormModal
        :open="modalOpen"
        :category="editing"
        @close="modalOpen = false"
        @save="handleSave"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonIcon, IonFab, IonFabButton, alertController } from '@ionic/vue';
import * as ionicons from 'ionicons/icons';
import { add, createOutline, trashOutline } from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import CategoryFormModal from '@/components/CategoryFormModal.vue';
import { useFinance } from '@/composables/useFinance';
import { Category, MovementType } from '@/types';

const { categories, addCategory, updateCategory, deleteCategory } = useFinance();

const modalOpen = ref(false);
const editing = ref<Category | null>(null);

function iconFor(name: string) {
  const map = ionicons as Record<string, string>;
  const key = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return map[key] ?? map.ellipsisHorizontal;
}

function openCreate() {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(category: Category) {
  editing.value = category;
  modalOpen.value = true;
}

function handleSave(payload: { name: string; type: MovementType; icon: string; color: string }) {
  if (editing.value) {
    updateCategory(editing.value.id, payload);
  } else {
    addCategory(payload);
  }
  modalOpen.value = false;
}

async function confirmDelete(category: Category) {
  const alert = await alertController.create({
    header: 'Eliminar categoría',
    message: `Se eliminará "${category.name}" y sus movimientos asociados.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Eliminar', role: 'destructive', handler: () => deleteCategory(category.id) },
    ],
  });
  await alert.present();
}
</script>

<style scoped>
.cat-list {
  padding: 0 20px 96px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--by-surface);
  border-radius: var(--by-radius);
  box-shadow: var(--by-shadow);
  padding: 16px;
}

.cat-icon {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.cat-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--by-text);
}

.cat-type {
  font-size: 13px;
  color: var(--by-text-muted);
}

.cat-type.income {
  color: var(--by-green);
}

.cat-action {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--by-text-muted);
  font-size: 19px;
  cursor: pointer;
}

ion-fab-button {
  --background: var(--by-black);
  --background-activated: var(--by-dark);
  --box-shadow: 0 8px 20px rgba(15, 17, 23, 0.3);
}
</style>
