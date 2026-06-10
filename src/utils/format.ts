export function formatCurrency(amount: number, withDecimals = false): string {
  const value = Math.abs(amount).toLocaleString('es-CO', {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  });
  return `$${value}`;
}

export function formatSigned(amount: number, type: 'income' | 'expense', withDecimals = false): string {
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${formatCurrency(amount, withDecimals)}`;
}

export function formatPeriod(date: Date = new Date()): string {
  const month = date.toLocaleDateString('es-ES', { month: 'long' });
  const year = date.getFullYear();
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function relativeDayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = Math.round((startOfToday - startOfDate) / DAY_MS);

  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  const label = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${label}, ${formatTime(iso)} hs`;
}

export function toDateInputValue(iso: string): string {
  return new Date(iso).toISOString();
}

export function sameMonth(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}
