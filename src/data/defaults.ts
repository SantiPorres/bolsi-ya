import { Category, Movement } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Alimentación', type: 'expense', icon: 'restaurant', color: '#ef6f6f', isDefault: true },
  { id: 'cat-transport', name: 'Transporte', type: 'expense', icon: 'bus', color: '#6c8cff', isDefault: true },
  { id: 'cat-fun', name: 'Entretenimiento', type: 'expense', icon: 'game-controller', color: '#a06cff', isDefault: true },
  { id: 'cat-health', name: 'Salud', type: 'expense', icon: 'medkit', color: '#4ec0c0', isDefault: true },
  { id: 'cat-education', name: 'Educación', type: 'expense', icon: 'school', color: '#f4a64a', isDefault: true },
  { id: 'cat-home', name: 'Hogar', type: 'expense', icon: 'home', color: '#7c83a8', isDefault: true },
  { id: 'cat-other-expense', name: 'Otros', type: 'expense', icon: 'ellipsis-horizontal', color: '#9aa0ab', isDefault: true },
  { id: 'cat-salary', name: 'Salario', type: 'income', icon: 'cash', color: '#15b881', isDefault: true },
  { id: 'cat-other-income', name: 'Otros Ingresos', type: 'income', icon: 'add-circle', color: '#00a86b', isDefault: true },
];

const now = new Date();
const iso = (daysAgo: number, hour: number, minute: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const SEED_MOVEMENTS: Movement[] = [
  { id: 'mv-1', type: 'expense', amount: 125000, categoryId: 'cat-food', description: 'Supermercado', date: iso(0, 14, 30) },
  { id: 'mv-2', type: 'income', amount: 112750, categoryId: 'cat-salary', description: 'Nómina quincenal', date: iso(0, 9, 0) },
  { id: 'mv-3', type: 'expense', amount: 10000, categoryId: 'cat-transport', description: 'Carga Tarjeta MegaBus', date: iso(1, 18, 45) },
  { id: 'mv-4', type: 'expense', amount: 4500, categoryId: 'cat-food', description: 'Cafetería U', date: iso(1, 9, 10) },
  { id: 'mv-5', type: 'expense', amount: 43990, categoryId: 'cat-fun', description: 'Suscripción Netflix', date: iso(1, 2, 0) },
  { id: 'mv-6', type: 'income', amount: 237750, categoryId: 'cat-salary', description: 'Pago freelance', date: iso(5, 11, 15) },
];
