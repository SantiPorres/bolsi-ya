import { computed, reactive, watch } from 'vue';
import { Category, HistoryFilters, Movement, MonthlySummary, MovementType } from '@/types';
import { DEFAULT_CATEGORIES, SEED_MOVEMENTS } from '@/data/defaults';
import { sameMonth } from '@/utils/format';

const MOVEMENTS_KEY = 'bolsiya.movements';
const CATEGORIES_KEY = 'bolsiya.categories';
const SEEDED_KEY = 'bolsiya.seeded';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const seeded = localStorage.getItem(SEEDED_KEY) === '1';

const state = reactive({
  movements: load<Movement[]>(MOVEMENTS_KEY, seeded ? [] : SEED_MOVEMENTS),
  categories: load<Category[]>(CATEGORIES_KEY, seeded ? [] : DEFAULT_CATEGORIES),
});

if (!seeded) {
  localStorage.setItem(SEEDED_KEY, '1');
}

watch(() => state.movements, (v) => localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(v)), { deep: true });
watch(() => state.categories, (v) => localStorage.setItem(CATEGORIES_KEY, JSON.stringify(v)), { deep: true });

const sortedMovements = computed(() =>
  [...state.movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
);

export function useFinance() {
  function getCategory(id: string): Category | undefined {
    return state.categories.find((c) => c.id === id);
  }

  function getMovement(id: string): Movement | undefined {
    return state.movements.find((m) => m.id === id);
  }

  function addMovement(data: Omit<Movement, 'id'>): Movement {
    const movement: Movement = { ...data, id: uid('mv') };
    state.movements.push(movement);
    return movement;
  }

  function updateMovement(id: string, data: Omit<Movement, 'id'>): void {
    const index = state.movements.findIndex((m) => m.id === id);
    if (index !== -1) {
      state.movements[index] = { ...data, id };
    }
  }

  function deleteMovement(id: string): void {
    state.movements = state.movements.filter((m) => m.id !== id);
  }

  function addCategory(data: Omit<Category, 'id' | 'isDefault'>): Category {
    const category: Category = { ...data, id: uid('cat'), isDefault: false };
    state.categories.push(category);
    return category;
  }

  function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'isDefault'>>): void {
    const index = state.categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      state.categories[index] = { ...state.categories[index], ...data };
    }
  }

  function deleteCategory(id: string): void {
    state.categories = state.categories.filter((c) => c.id !== id);
    state.movements = state.movements.filter((m) => m.categoryId !== id);
  }

  function categoriesByType(type: MovementType): Category[] {
    return state.categories.filter((c) => c.type === type);
  }

  function monthlySummary(ref: Date = new Date()): MonthlySummary {
    const inMonth = state.movements.filter((m) => sameMonth(m.date, ref));
    const income = inMonth.filter((m) => m.type === 'income').reduce((s, m) => s + m.amount, 0);
    const expense = inMonth.filter((m) => m.type === 'expense').reduce((s, m) => s + m.amount, 0);
    return { income, expense, balance: income - expense };
  }

  function monthlyChangePercent(ref: Date = new Date()): number | null {
    const prev = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
    const current = monthlySummary(ref).balance;
    const previous = monthlySummary(prev).balance;
    if (previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  function recentMovements(limit = 5): Movement[] {
    return sortedMovements.value.slice(0, limit);
  }

  function filteredMovements(filters: HistoryFilters): Movement[] {
    return sortedMovements.value.filter((m) => {
      if (filters.type !== 'all' && m.type !== filters.type) return false;
      if (filters.categoryId !== 'all' && m.categoryId !== filters.categoryId) return false;
      if (filters.from && new Date(m.date) < new Date(filters.from)) return false;
      if (filters.to && new Date(m.date) > new Date(filters.to)) return false;
      return true;
    });
  }

  function expenseByCategory(ref: Date = new Date()) {
    const inMonth = state.movements.filter((m) => m.type === 'expense' && sameMonth(m.date, ref));
    const total = inMonth.reduce((s, m) => s + m.amount, 0);
    const grouped = new Map<string, number>();
    for (const m of inMonth) {
      grouped.set(m.categoryId, (grouped.get(m.categoryId) ?? 0) + m.amount);
    }
    return {
      total,
      slices: [...grouped.entries()]
        .map(([categoryId, amount]) => {
          const category = getCategory(categoryId);
          return {
            categoryId,
            name: category?.name ?? 'Otros',
            color: category?.color ?? '#9aa0ab',
            amount,
            percent: total > 0 ? (amount / total) * 100 : 0,
          };
        })
        .sort((a, b) => b.amount - a.amount),
    };
  }

  return {
    state,
    movements: sortedMovements,
    categories: computed(() => state.categories),
    getCategory,
    getMovement,
    addMovement,
    updateMovement,
    deleteMovement,
    addCategory,
    updateCategory,
    deleteCategory,
    categoriesByType,
    monthlySummary,
    monthlyChangePercent,
    recentMovements,
    filteredMovements,
    expenseByCategory,
  };
}
