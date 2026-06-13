const currencyFmt = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
});

const numberFmt = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });

export function formatCurrency(value: number): string {
  return currencyFmt.format(value);
}

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

const HEB_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

// "2026-06" -> "יוני 2026"
export function formatMonth(key: string): string {
  if (key === 'all') return 'כל התקופה';
  const [y, m] = key.split('-');
  return `${HEB_MONTHS[Number(m) - 1]} ${y}`;
}

// "2026-06-13" -> "13 ביוני"
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ב${HEB_MONTHS[d.getMonth()]}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'לילה טוב';
  if (h < 12) return 'בוקר טוב';
  if (h < 18) return 'צהריים טובים';
  return 'ערב טוב';
}
