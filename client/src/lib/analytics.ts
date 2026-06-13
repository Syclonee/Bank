// חישובי סטטיסטיקה לדשבורד (צד-לקוח).
import type { Transaction, Summary, CategoryStat, CategoryAverage, TrendPoint } from '../types';
import { getCategoryMeta } from './categories';

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function filterByMonth(txs: Transaction[], month: string): Transaction[] {
  if (!month || month === 'all') return txs;
  return txs.filter((t) => monthKey(t.date) === month);
}

export function listMonths(txs: Transaction[]): string[] {
  const set = new Set(txs.map((t) => monthKey(t.date)));
  return [...set].sort().reverse();
}

export function summary(txs: Transaction[]): Summary {
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.amount > 0) income += t.amount;
    else expense += Math.abs(t.amount);
  }
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
  return {
    income: Math.round(income),
    expense: Math.round(expense),
    balance: Math.round(balance),
    savingsRate,
    count: txs.length,
  };
}

export function byCategory(txs: Transaction[]): CategoryStat[] {
  const groups: Record<string, { total: number; count: number }> = {};
  for (const t of txs) {
    if (t.amount >= 0) continue;
    const cat = t.category || 'other';
    if (!groups[cat]) groups[cat] = { total: 0, count: 0 };
    groups[cat].total += Math.abs(t.amount);
    groups[cat].count += 1;
  }
  const totalExpense = Object.values(groups).reduce((s, g) => s + g.total, 0) || 1;
  return Object.entries(groups)
    .map(([id, g]) => {
      const meta = getCategoryMeta(id);
      return {
        id,
        name: meta.name,
        color: meta.color,
        icon: meta.icon,
        total: Math.round(g.total),
        count: g.count,
        avg: Math.round(g.total / g.count),
        percent: Math.round((g.total / totalExpense) * 100),
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function monthlyAveragesByCategory(allTxs: Transaction[]): CategoryAverage[] {
  const numMonths = listMonths(allTxs).length || 1;
  const totals: Record<string, number> = {};
  for (const t of allTxs) {
    if (t.amount >= 0) continue;
    const cat = t.category || 'other';
    totals[cat] = (totals[cat] || 0) + Math.abs(t.amount);
  }
  return Object.entries(totals)
    .map(([id, total]) => {
      const meta = getCategoryMeta(id);
      return {
        id,
        name: meta.name,
        color: meta.color,
        icon: meta.icon,
        monthlyAvg: Math.round(total / numMonths),
      };
    })
    .sort((a, b) => b.monthlyAvg - a.monthlyAvg);
}

export function monthlyTrend(allTxs: Transaction[]): TrendPoint[] {
  const map: Record<string, TrendPoint> = {};
  for (const t of allTxs) {
    const k = monthKey(t.date);
    if (!map[k]) map[k] = { month: k, income: 0, expense: 0, balance: 0 };
    if (t.amount > 0) map[k].income += t.amount;
    else map[k].expense += Math.abs(t.amount);
  }
  return Object.values(map)
    .map((m) => ({
      month: m.month,
      income: Math.round(m.income),
      expense: Math.round(m.expense),
      balance: Math.round(m.income - m.expense),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
