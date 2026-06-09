import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Transaction, Category, TransactionType } from '@/types'

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Comida', icon: '🍔', color: '#FF6B6B', type: 'expense' },
  { id: 'transport', name: 'Transporte', icon: '🚌', color: '#4ECDC4', type: 'expense' },
  { id: 'housing', name: 'Vivienda', icon: '🏠', color: '#45B7D1', type: 'expense' },
  { id: 'health', name: 'Salud', icon: '💊', color: '#96CEB4', type: 'expense' },
  { id: 'entertainment', name: 'Ocio', icon: '🎮', color: '#FFEAA7', type: 'expense' },
  { id: 'clothes', name: 'Ropa', icon: '👕', color: '#DDA0DD', type: 'expense' },
  { id: 'education', name: 'Educación', icon: '📚', color: '#98D8C8', type: 'expense' },
  { id: 'salary', name: 'Sueldo', icon: '💼', color: '#7EC8E3', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#B8E0D2', type: 'income' },
  { id: 'other_income', name: 'Otros ingresos', icon: '💰', color: '#A8D8EA', type: 'income' },
  { id: 'other_expense', name: 'Otros gastos', icon: '📋', color: '#CFCFCF', type: 'expense' },
]

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — silent fail
  }
}

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<Transaction[]>(loadFromStorage('bolsiya_transactions', []))
  const categories = ref<Category[]>(loadFromStorage('bolsiya_categories', DEFAULT_CATEGORIES))

  // ─── Persistencia automática ───────────────────────────────────────────────
  function persist() {
    saveToStorage('bolsiya_transactions', transactions.value)
    saveToStorage('bolsiya_categories', categories.value)
  }

  // ─── Computed ──────────────────────────────────────────────────────────────
  const currentMonthTransactions = computed(() => {
    const now = new Date()
    return transactions.value.filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
  })

  const totalIncome = computed(() =>
    currentMonthTransactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
  )

  const totalExpenses = computed(() =>
    currentMonthTransactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  )

  const balance = computed(() => totalIncome.value - totalExpenses.value)

  const recentTransactions = computed(() =>
    [...transactions.value]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20),
  )

  const expensesByCategory = computed(() => {
    const map: Record<string, number> = {}
    currentMonthTransactions.value
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount
      })
    return Object.entries(map)
      .map(([categoryId, total]) => ({
        category: categories.value.find((c) => c.id === categoryId),
        total,
      }))
      .filter((e) => e.category)
      .sort((a, b) => b.total - a.total)
  })

  const lastSixMonthsData = computed(() => {
    const result: { label: string; income: number; expenses: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthTxs = transactions.value.filter((t) => {
        const td = new Date(t.date)
        return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
      })
      result.push({
        label: d.toLocaleDateString('es-ES', { month: 'short' }),
        income: monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      })
    }
    return result
  })

  // ─── Mutaciones ────────────────────────────────────────────────────────────
  function addTransaction(data: Omit<Transaction, 'id'>) {
    const tx: Transaction = { ...data, id: crypto.randomUUID() }
    transactions.value.unshift(tx)
    persist()
    return tx
  }

  function deleteTransaction(id: string) {
    transactions.value = transactions.value.filter((t) => t.id !== id)
    persist()
  }

  function addCategory(data: Omit<Category, 'id'>) {
    const cat: Category = { ...data, id: crypto.randomUUID() }
    categories.value.push(cat)
    persist()
    return cat
  }

  function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>) {
    const idx = categories.value.findIndex((c) => c.id === id)
    if (idx !== -1) {
      categories.value[idx] = { ...categories.value[idx], ...data }
      persist()
    }
  }

  function deleteCategory(id: string) {
    categories.value = categories.value.filter((c) => c.id !== id)
    persist()
  }

  function getCategoryById(id: string) {
    return categories.value.find((c) => c.id === id)
  }

  function getCategoriesByType(type: TransactionType) {
    return categories.value.filter((c) => c.type === type || c.type === 'both')
  }

  return {
    transactions,
    categories,
    currentMonthTransactions,
    totalIncome,
    totalExpenses,
    balance,
    recentTransactions,
    expensesByCategory,
    lastSixMonthsData,
    addTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoriesByType,
  }
})
