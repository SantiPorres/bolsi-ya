<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">

      <!-- Type filter -->
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

      <div class="cat-list">
        <div
          v-for="cat in filteredCategories"
          :key="cat.id"
          class="cat-card"
          @click="openEditModal(cat)"
        >
          <div class="cat-avatar" :style="{ background: cat.color + '22' }">
            <span>{{ cat.icon }}</span>
          </div>
          <div class="cat-info">
            <p class="cat-name">{{ cat.name }}</p>
            <p class="cat-type">{{ cat.type === 'income' ? 'Ingreso' : cat.type === 'expense' ? 'Gasto' : 'Ambos' }}</p>
          </div>
          <div class="cat-dot" :style="{ background: cat.color }"></div>
          <svg class="chevron" width="8" height="13" viewBox="0 0 8 13" fill="none">
            <path d="M1 1l6 5.5L1 12" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
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

    <!-- Add/Edit Modal -->
    <ion-modal :is-open="showModal" @did-dismiss="closeModal" :initial-breakpoint="0.75" :breakpoints="[0, 0.75]" handle>
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeModal">Cancelar</ion-button>
          </ion-buttons>
          <ion-title>{{ editingCategory ? 'Editar categoría' : 'Nueva categoría' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" :disabled="!formValid" @click="saveCategory" strong>
              {{ editingCategory ? 'Guardar' : 'Añadir' }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <!-- Preview -->
        <div class="preview-row">
          <div class="preview-icon" :style="{ background: form.color + '33' }">
            <span>{{ form.icon || '❓' }}</span>
          </div>
          <span class="preview-name">{{ form.name || 'Nueva categoría' }}</span>
        </div>

        <div class="field-group">
          <label class="field-label">Nombre</label>
          <ion-input v-model="form.name" placeholder="Ej: Restaurantes" class="text-input" />
        </div>

        <div class="field-group">
          <label class="field-label">Emoji / Icono</label>
          <div class="emoji-grid">
            <button
              v-for="emoji in emojiList"
              :key="emoji"
              :class="['emoji-btn', { active: form.icon === emoji }]"
              @click="form.icon = emoji"
            >{{ emoji }}</button>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">Color</label>
          <div class="color-grid">
            <button
              v-for="color in colorPalette"
              :key="color"
              :class="['color-dot', { active: form.color === color }]"
              :style="{ background: color }"
              @click="form.color = color"
            ></button>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">Tipo</label>
          <div class="type-selector">
            <button :class="['type-btn', { active: form.type === 'expense' }]" @click="form.type = 'expense'">Gasto</button>
            <button :class="['type-btn income', { active: form.type === 'income' }]" @click="form.type = 'income'">Ingreso</button>
            <button :class="['type-btn both', { active: form.type === 'both' }]" @click="form.type = 'both'">Ambos</button>
          </div>
        </div>

        <div v-if="editingCategory" class="delete-section">
          <ion-button expand="block" fill="outline" color="danger" @click="deleteCategory">
            Eliminar categoría
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonPage, IonContent, IonFab, IonFabButton, IonModal,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonInput
} from '@ionic/vue'
import { useFinanceStore } from '@/stores/finance'
import type { Category, TransactionType } from '@/types'

const store = useFinanceStore()
const activeFilter = ref<'all' | TransactionType>('all')
const showModal = ref(false)
const editingCategory = ref<Category | null>(null)

const filterOptions = [
  { label: 'Todas', value: 'all' as const },
  { label: 'Gastos', value: 'expense' as const },
  { label: 'Ingresos', value: 'income' as const },
]

const filteredCategories = computed(() => {
  if (activeFilter.value === 'all') return store.categories
  return store.categories.filter(c => c.type === activeFilter.value || c.type === 'both')
})

const emojiList = [
  '🍔','🍕','🛒','☕','🚌','🚗','✈️','🏠','💊','🏥',
  '🎮','🎬','🎵','📚','👕','👟','💄','💻','📱','💼',
  '💰','🎁','🐾','🌱','⚽','🏋️','💡','🔧','🎓','📋',
]

const colorPalette = [
  '#FF6B6B','#FF8E53','#FFD93D','#6BCB77','#4D96FF',
  '#C77DFF','#DDA0DD','#4ECDC4','#45B7D1','#96CEB4',
  '#FFEAA7','#A29BFE','#FD79A8','#00CEC9','#B8E0D2',
]

const defaultForm = () => ({
  name: '',
  icon: '📋',
  color: '#4D96FF',
  type: 'expense' as Category['type'],
})

const form = ref(defaultForm())

const formValid = computed(() => form.value.name.trim().length > 0)

function openAddModal() {
  editingCategory.value = null
  form.value = defaultForm()
  showModal.value = true
}

function openEditModal(cat: Category) {
  editingCategory.value = cat
  form.value = { name: cat.name, icon: cat.icon, color: cat.color, type: cat.type }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveCategory() {
  if (!formValid.value) return
  if (editingCategory.value) {
    store.updateCategory(editingCategory.value.id, {
      name: form.value.name.trim(),
      icon: form.value.icon,
      color: form.value.color,
      type: form.value.type,
    })
  } else {
    store.addCategory({
      name: form.value.name.trim(),
      icon: form.value.icon,
      color: form.value.color,
      type: form.value.type,
    })
  }
  closeModal()
}

function deleteCategory() {
  if (editingCategory.value) {
    store.deleteCategory(editingCategory.value.id)
  }
  closeModal()
}
</script>

<style scoped>
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
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

.cat-list { display: flex; flex-direction: column; gap: 2px; padding-bottom: 80px; }

.cat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 4px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.cat-card:last-child { border-bottom: none; }

.cat-avatar {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.cat-info { flex: 1; }
.cat-name { font-size: 15px; font-weight: 600; color: #111; margin: 0; }
.cat-type { font-size: 12px; color: #888; margin: 2px 0 0; }

.cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.chevron { flex-shrink: 0; }

/* Modal styles */
ion-toolbar { --background: #ffffff; }
ion-title { font-size: 16px; font-weight: 600; }

.preview-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.preview-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.preview-name { font-size: 18px; font-weight: 600; color: #111; }

.field-group { margin-bottom: 20px; }
.field-label { display: block; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }

.emoji-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.emoji-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid #e5e5e5;
  background: #f9f9f9;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.emoji-btn.active { border-color: #006C49; background: #006C4915; }

.color-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.color-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: transform 0.1s;
}
.color-dot.active { border-color: #111; transform: scale(1.15); }

.type-selector { display: flex; gap: 8px; }
.type-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1.5px solid #e0e0e0;
  background: #f5f5f5;
  font-size: 14px;
  font-weight: 500;
  color: #888;
  cursor: pointer;
}
.type-btn.active { border-color: #FF6B6B; background: #FF6B6B15; color: #CC3333; }
.type-btn.income.active { border-color: #006C49; background: #006C4915; color: #006C49; }
.type-btn.both.active { border-color: #4D96FF; background: #4D96FF15; color: #4D96FF; }

.text-input { --background: #f5f5f5; --border-radius: 10px; --padding-start: 14px; }

.delete-section { margin-top: 32px; }

ion-fab-button { --background: #006C49; }
</style>
