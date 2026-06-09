export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TransactionType | 'both'
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  categoryId: string
  note: string
  date: string // ISO 8601
}

export interface MonthSummary {
  income: number
  expenses: number
  balance: number
}
