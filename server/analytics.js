// חישובי סטטיסטיקה לדשבורד: סיכומים, פילוח קטגוריות, ממוצעים ומגמות חודשיות.
import { CATEGORIES, CATEGORY_MAP } from './categories.js';

function monthKey(dateStr) {
  return dateStr.slice(0, 7); // YYYY-MM
}

// מסנן תנועות לפי חודש (YYYY-MM) או 'all'.
export function filterByMonth(txs, month) {
  if (!month || month === 'all') return txs;
  return txs.filter((t) => monthKey(t.date) === month);
}

export function listMonths(txs) {
  const set = new Set(txs.map((t) => monthKey(t.date)));
  return [...set].sort().reverse();
}

// מחזיר סיכום: הכנסות, הוצאות, מאזן, אחוז חיסכון לתקופה נתונה.
export function summary(txs) {
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

// פילוח הוצאות לפי קטגוריה, כולל סכום כולל, מספר תנועות וממוצע לתנועה.
export function byCategory(txs) {
  const groups = {};
  for (const t of txs) {
    if (t.amount >= 0) continue; // רק הוצאות
    const cat = t.category || 'other';
    if (!groups[cat]) groups[cat] = { total: 0, count: 0 };
    groups[cat].total += Math.abs(t.amount);
    groups[cat].count += 1;
  }

  const totalExpense = Object.values(groups).reduce((s, g) => s + g.total, 0) || 1;

  return Object.entries(groups)
    .map(([id, g]) => {
      const meta = CATEGORY_MAP[id] || { name: id, color: '#a1a1aa', icon: '📦' };
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

// ממוצע הוצאה חודשי לכל קטגוריה על פני כל ההיסטוריה (לא תלוי בסינון חודש).
export function monthlyAveragesByCategory(allTxs) {
  const months = listMonths(allTxs);
  const numMonths = months.length || 1;
  const totals = {};
  for (const t of allTxs) {
    if (t.amount >= 0) continue;
    const cat = t.category || 'other';
    totals[cat] = (totals[cat] || 0) + Math.abs(t.amount);
  }
  return Object.entries(totals)
    .map(([id, total]) => {
      const meta = CATEGORY_MAP[id] || { name: id, color: '#a1a1aa', icon: '📦' };
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

// מגמה חודשית: הכנסות והוצאות לכל חודש.
export function monthlyTrend(allTxs) {
  const map = {};
  for (const t of allTxs) {
    const k = monthKey(t.date);
    if (!map[k]) map[k] = { month: k, income: 0, expense: 0 };
    if (t.amount > 0) map[k].income += t.amount;
    else map[k].expense += Math.abs(t.amount);
  }
  return Object.values(map)
    .map((m) => ({
      ...m,
      income: Math.round(m.income),
      expense: Math.round(m.expense),
      balance: Math.round(m.income - m.expense),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function allCategories() {
  return CATEGORIES;
}
