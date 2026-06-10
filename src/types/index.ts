export type MovementType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: MovementType;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Movement {
  id: string;
  type: MovementType;
  amount: number;
  categoryId: string;
  description?: string;
  date: string;
}

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}

export interface HistoryFilters {
  type: MovementType | 'all';
  categoryId: string | 'all';
  from: string | null;
  to: string | null;
}
