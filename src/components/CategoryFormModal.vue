<template>
  <ion-modal :is-open="open" @did-dismiss="$emit('close')">
    <div class="cat-form">
      <div class="cat-form-head">
        <h2>{{ category ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
        <button type="button" class="close" @click="$emit('close')">
          <ion-icon :icon="closeOutline" />
        </button>
      </div>

      <label class="lbl">Nombre</label>
      <input v-model="name" class="text-input" placeholder="Ej: Mascotas" />

      <label class="lbl">Tipo</label>
      <div class="type-switch">
        <button type="button" :class="{ active: type === 'expense' }" @click="type = 'expense'">Gasto</button>
        <button type="button" :class="{ active: type === 'income' }" @click="type = 'income'">Ingreso</button>
      </div>

      <label class="lbl">Color</label>
      <div class="swatches">
        <button
          v-for="c in palette"
          :key="c"
          type="button"
          class="swatch"
          :class="{ active: color === c }"
          :style="{ backgroundColor: c }"
          @click="color = c"
        />
      </div>

      <label class="lbl">Icono</label>
      <div class="icons">
        <button
          v-for="ic in iconChoices"
          :key="ic.name"
          type="button"
          class="icon-choice"
          :class="{ active: icon === ic.name }"
          @click="icon = ic.name"
        >
          <ion-icon :icon="ic.value" />
        </button>
      </div>

      <button type="button" class="save-btn" @click="submit">Guardar</button>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IonModal, IonIcon } from '@ionic/vue';
import {
  closeOutline,
  home,
  restaurant,
  bus,
  gameController,
  medkit,
  school,
  cash,
  cart,
  gift,
  airplane,
  paw,
  fitness,
  card,
} from 'ionicons/icons';
import { Category, MovementType } from '@/types';

const props = defineProps<{ open: boolean; category: Category | null }>();
const emit = defineEmits<{
  close: [];
  save: [payload: { name: string; type: MovementType; icon: string; color: string }];
}>();

const palette = ['#ef6f6f', '#6c8cff', '#a06cff', '#4ec0c0', '#f4a64a', '#15b881', '#7c83a8', '#e5484d'];
const iconChoices = [
  { name: 'home', value: home },
  { name: 'restaurant', value: restaurant },
  { name: 'bus', value: bus },
  { name: 'game-controller', value: gameController },
  { name: 'medkit', value: medkit },
  { name: 'school', value: school },
  { name: 'cash', value: cash },
  { name: 'cart', value: cart },
  { name: 'gift', value: gift },
  { name: 'airplane', value: airplane },
  { name: 'paw', value: paw },
  { name: 'fitness', value: fitness },
  { name: 'card', value: card },
];

const name = ref('');
const type = ref<MovementType>('expense');
const color = ref(palette[0]);
const icon = ref('home');

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    if (props.category) {
      name.value = props.category.name;
      type.value = props.category.type;
      color.value = props.category.color;
      icon.value = props.category.icon;
    } else {
      name.value = '';
      type.value = 'expense';
      color.value = palette[0];
      icon.value = 'home';
    }
  }
);

function submit() {
  if (!name.value.trim()) return;
  emit('save', { name: name.value.trim(), type: type.value, icon: icon.value, color: color.value });
}
</script>

<style scoped>
.cat-form {
  padding: 22px 20px 28px;
  display: flex;
  flex-direction: column;
}

.cat-form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cat-form-head h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--by-text-muted);
  cursor: pointer;
}

.lbl {
  font-size: 13px;
  color: var(--by-text-muted);
  margin: 16px 0 8px;
}

.text-input {
  border: 1px solid var(--by-border);
  border-radius: 12px;
  background: #f7f8fa;
  padding: 14px;
  font-size: 16px;
  color: var(--by-text);
  outline: none;
}

.type-switch {
  display: flex;
  gap: 8px;
  background: #e8eaf0;
  border-radius: 12px;
  padding: 4px;
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

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.swatch {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}

.swatch.active {
  border-color: var(--by-text);
}

.icons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.icon-choice {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  border: 1px solid var(--by-border);
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--by-text-muted);
  cursor: pointer;
}

.icon-choice.active {
  border-color: var(--by-green);
  color: var(--by-green);
  background: rgba(0, 135, 90, 0.06);
}

.save-btn {
  margin-top: 24px;
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
