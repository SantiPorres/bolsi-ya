<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <div class="form-screen">
        <h1 class="by-screen-title">{{ isEdit ? 'Editar Movimiento' : 'Registrar Movimiento' }}</h1>
        <p class="by-screen-subtitle">
          {{ isEdit ? 'Actualiza los datos del movimiento.' : 'Añade un nuevo ingreso o gasto a tu cuenta.' }}
        </p>

        <div class="type-switch">
          <button
            type="button"
            :class="{ active: form.type === 'expense' }"
            @click="setType('expense')"
          >
            Gasto
          </button>
          <button
            type="button"
            :class="{ active: form.type === 'income' }"
            @click="setType('income')"
          >
            Ingreso
          </button>
        </div>

        <div class="form-card">
          <div class="amount-field" :class="{ error: errors.amount }">
            <span class="currency">$</span>
            <input
              v-model="amountText"
              inputmode="decimal"
              placeholder="0.00"
              class="amount-input"
            />
          </div>

          <label class="field-label">Categoría</label>
          <ion-select
            v-model="form.categoryId"
            interface="action-sheet"
            placeholder="Selecciona una categoría"
            class="field-control"
            :class="{ error: errors.categoryId }"
          >
            <ion-select-option v-for="c in categoryOptions" :key="c.id" :value="c.id">
              {{ c.name }}
            </ion-select-option>
          </ion-select>

          <label class="field-label">Fecha</label>
          <ion-datetime-button datetime="movement-date" class="date-trigger" />
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime
              id="movement-date"
              v-model="form.date"
              presentation="date"
              :show-default-buttons="true"
              done-text="Listo"
              cancel-text="Cancelar"
            />
          </ion-modal>

          <label class="field-label">Descripción (opcional)</label>
          <ion-textarea
            v-model="form.description"
            :auto-grow="true"
            :rows="2"
            class="field-control"
            placeholder="Ej: Compra del mercado"
          />

          <button class="save-btn" type="button" @click="save">
            {{ isEdit ? 'Guardar Cambios' : 'Guardar Movimiento' }}
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  toastController,
} from '@ionic/vue';
import AppHeader from '@/components/AppHeader.vue';
import { useFinance } from '@/composables/useFinance';
import { MovementType } from '@/types';

const route = useRoute();
const router = useRouter();
const { categoriesByType, addMovement, updateMovement, getMovement } = useFinance();

const editId = computed(() => (route.params.id as string) || null);
const isEdit = computed(() => editId.value !== null);

const form = reactive({
  type: 'expense' as MovementType,
  categoryId: '' as string,
  date: new Date().toISOString(),
  description: '' as string,
});

const amountText = ref('');
const errors = reactive({ amount: false, categoryId: false });

const categoryOptions = computed(() => categoriesByType(form.type));

function setType(type: MovementType) {
  if (form.type === type) return;
  form.type = type;
  form.categoryId = '';
}

watch(editId, (id) => {
  if (!id) return;
  const movement = getMovement(id);
  if (movement) {
    form.type = movement.type;
    form.categoryId = movement.categoryId;
    form.date = movement.date;
    form.description = movement.description ?? '';
    amountText.value = String(movement.amount);
  }
}, { immediate: true });

function parseAmount(): number {
  const normalized = amountText.value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
  return Math.round(parseFloat(normalized) * 100) / 100 || 0;
}

async function notify(message: string) {
  const toast = await toastController.create({ message, duration: 1600, position: 'top', color: 'dark' });
  await toast.present();
}

async function save() {
  const amount = parseAmount();
  errors.amount = amount <= 0;
  errors.categoryId = !form.categoryId;
  if (errors.amount || errors.categoryId) {
    await notify('Completa el monto y la categoría.');
    return;
  }

  const payload = {
    type: form.type,
    amount,
    categoryId: form.categoryId,
    date: form.date,
    description: form.description.trim() || undefined,
  };

  if (isEdit.value && editId.value) {
    updateMovement(editId.value, payload);
    await notify('Movimiento actualizado.');
    router.replace(`/tabs/movement/${editId.value}`);
  } else {
    addMovement(payload);
    await notify('Movimiento guardado.');
    router.replace('/tabs/home');
  }
}
</script>

<style scoped>
.form-screen {
  padding-bottom: 32px;
}

.type-switch {
  display: flex;
  gap: 8px;
  background: #e8eaf0;
  border-radius: 12px;
  padding: 4px;
  margin: 8px 20px 20px;
}

.type-switch button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 9px;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  color: var(--by-text-muted);
  cursor: pointer;
}

.type-switch button.active {
  background: var(--by-surface);
  color: var(--by-text);
  box-shadow: var(--by-shadow);
}

.form-card {
  margin: 0 20px;
  background: var(--by-surface);
  border-radius: 20px;
  box-shadow: var(--by-shadow);
  padding: 22px;
  display: flex;
  flex-direction: column;
}

.amount-field {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--by-border);
  padding-bottom: 12px;
  margin-bottom: 22px;
}

.amount-field.error {
  border-bottom-color: var(--by-red);
}

.currency {
  font-size: 34px;
  font-weight: 700;
  color: var(--by-text);
}

.amount-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 34px;
  font-weight: 700;
  color: var(--by-text);
  background: transparent;
  width: 100%;
}

.amount-input::placeholder {
  color: #cfd3db;
}

.field-label {
  font-size: 13px;
  color: var(--by-text-muted);
  margin-bottom: 8px;
}

.field-control {
  border: 1px solid var(--by-border);
  border-radius: 12px;
  background: #f7f8fa;
  margin-bottom: 18px;
  --padding-start: 14px;
  --padding-end: 14px;
  padding-left: 14px;
  padding-right: 14px;
  min-height: 48px;
}

.field-control.error {
  border-color: var(--by-red);
}

ion-textarea.field-control {
  padding-top: 4px;
  padding-bottom: 4px;
}

.date-trigger {
  align-self: flex-start;
  margin-bottom: 18px;
}

ion-datetime-button::part(native) {
  background: #f7f8fa;
  border: 1px solid var(--by-border);
  border-radius: 12px;
  color: var(--by-text);
}

.save-btn {
  margin-top: 6px;
  padding: 16px;
  border: none;
  border-radius: 999px;
  background: var(--by-black);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>
