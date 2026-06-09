<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="close" fill="clear">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
          </svg>
        </ion-button>
      </ion-buttons>
      <ion-title>{{ isEditing ? 'Editar' : 'Nueva' }} transacción</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <!-- Tipo -->
    <div class="type-selector">
      <button
        :class="['type-btn', { active: form.type === 'expense' }]"
        @click="form.type = 'expense'"
      >
        <span>Gasto</span>
      </button>
      <button
        :class="['type-btn income', { active: form.type === 'income' }]"
        @click="form.type = 'income'"
      >
        <span>Ingreso</span>
      </button>
    </div>

    <!-- Monto -->
    <div class="amount-field">
      <span class="currency-symbol">$</span>
      <input
        ref="amountInput"
        v-model="amountDisplay"
        inputmode="decimal"
        placeholder="0.00"
        class="amount-input"
        @input="onAmountInput"
      />
    </div>

    <!-- Categoría -->
    <div class="field-group">
      <label class="field-label">Categoría</label>
      <div class="categories-grid">
        <button
          v-for="cat in availableCategories"
          :key="cat.id"
          :class="['cat-chip', { active: form.categoryId === cat.id }]"
          :style="form.categoryId === cat.id ? { background: cat.color + '33', borderColor: cat.color } : {}"
          @click="form.categoryId = cat.id"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Nota -->
    <div class="field-group">
      <label class="field-label">Nota (opcional)</label>
      <ion-input
        v-model="form.note"
        placeholder="Ej: Supermercado semanal"
        class="text-input"
      />
    </div>

    <!-- Fecha -->
    <div class="field-group">
      <label class="field-label">Fecha</label>
      <ion-input
        type="date"
        v-model="form.date"
        class="text-input"
      />
    </div>

    <div class="actions">
      <ion-button expand="block" :color="form.type === 'income' ? 'success' : 'danger'" @click="submit" :disabled="!isValid">
        {{ isEditing ? 'Guardar cambios' : form.type === 'expense' ? 'Agregar gasto' : 'Agregar ingreso' }}
      </ion-button>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonInput, modalController
} from '@ionic/vue'
import { useFinanceStore } from '@/stores/finance'
import type { Transaction, TransactionType } from '@/types'

const props = defineProps<{
  transaction?: Transaction
  defaultType?: TransactionType
}>()

const store = useFinanceStore()
const amountInput = ref<HTMLInputElement | null>(null)

const today = new Date().toISOString().split('T')[0]

const form = ref({
  type: (props.transaction?.type ?? props.defaultType ?? 'expense') as TransactionType,
  amount: props.transaction?.amount ?? 0,
  categoryId: props.transaction?.categoryId ?? '',
  note: props.transaction?.note ?? '',
  date: props.transaction?.date.split('T')[0] ?? today,
})

const amountDisplay = ref(props.transaction?.amount ? String(props.transaction.amount) : '')
const isEditing = computed(() => !!props.transaction)

const availableCategories = computed(() => store.getCategoriesByType(form.value.type))

watch(() => form.value.type, () => {
  if (form.value.categoryId) {
    const stillValid = availableCategories.value.find(c => c.id === form.value.categoryId)
    if (!stillValid) form.value.categoryId = ''
  }
})

const isValid = computed(() =>
  form.value.amount > 0 && form.value.categoryId !== ''
)

function onAmountInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9.]/g, '')
  amountDisplay.value = raw
  form.value.amount = parseFloat(raw) || 0
}

function submit() {
  if (!isValid.value) return
  const data = {
    type: form.value.type,
    amount: form.value.amount,
    categoryId: form.value.categoryId,
    note: form.value.note.trim(),
    date: new Date(form.value.date + 'T12:00:00').toISOString(),
  }
  if (isEditing.value && props.transaction) {
    store.deleteTransaction(props.transaction.id)
  }
  store.addTransaction(data)
  modalController.dismiss(null, 'confirm')
}

function close() {
  modalController.dismiss(null, 'cancel')
}

onMounted(() => {
  nextTick(() => amountInput.value?.focus())
})
</script>

<style scoped>
ion-toolbar {
  --background: #ffffff;
}

ion-title {
  font-size: 16px;
  font-weight: 600;
}

.type-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.type-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  background: #f5f5f5;
  font-size: 15px;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  border-color: #FF6B6B;
  background: #FF6B6B15;
  color: #FF6B6B;
}

.type-btn.income.active {
  border-color: #006C49;
  background: #006C4915;
  color: #006C49;
}

.amount-field {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 32px;
}

.currency-symbol {
  font-size: 36px;
  font-weight: 300;
  color: #333;
}

.amount-input {
  font-size: 52px;
  font-weight: 200;
  border: none;
  outline: none;
  background: transparent;
  width: 200px;
  text-align: center;
  color: #111;
}

.amount-input::placeholder {
  color: #ccc;
}

.field-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.categories-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1.5px solid #e5e5e5;
  background: #f9f9f9;
  cursor: pointer;
  transition: all 0.15s;
}

.cat-chip.active {
  border-width: 2px;
}

.cat-icon {
  font-size: 16px;
  line-height: 1;
}

.cat-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.text-input {
  --background: #f5f5f5;
  --border-radius: 10px;
  --padding-start: 14px;
  --padding-end: 14px;
  border-radius: 10px;
}

.actions {
  margin-top: 32px;
  padding-bottom: 16px;
}

ion-button {
  --border-radius: 12px;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
}
</style>
