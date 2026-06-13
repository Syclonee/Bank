import { useMemo, useState } from 'react';
import type { Transaction, Category } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onChangeCategory: (id: string, category: string) => void;
}

export default function TransactionsTable({ transactions, categories, onChangeCategory }: Props) {
  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );
  const [editing, setEditing] = useState<string | null>(null);

  if (!transactions.length) {
    return <div className="text-center text-ink-400 py-12">לא נמצאו תנועות</div>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {transactions.map((t) => {
        const cat = catMap[t.category] || { name: t.category, color: '#a1a1aa', icon: '📦' };
        const isIncome = t.amount > 0;
        return (
          <div key={t.id} className="flex items-center gap-3 py-3 group">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: cat.color + '1a' }}
            >
              {cat.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-900 truncate">{t.description || 'ללא תיאור'}</div>
              <div className="text-xs text-ink-400 flex items-center gap-2">
                <span>{formatDate(t.date)}</span>
                <span className="text-slate-300">·</span>
                <span className="truncate">{t.account}</span>
              </div>
            </div>

            <div className="shrink-0">
              {editing === t.id ? (
                <select
                  autoFocus
                  defaultValue={t.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    // סוגרים את העריכה רק אם הקטגוריה באמת השתנתה
                    if (value !== t.category) onChangeCategory(t.id, value);
                    setEditing(null);
                  }}
                  // סגירה ביציאת פוקוס - בהשהיה קצרה כדי ש-onChange (אם ממתין) יספיק לרוץ
                  onBlur={() => setTimeout(() => setEditing(null), 150)}
                  className="text-xs rounded-lg border border-slate-200 px-2 py-1 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => setEditing(t.id)}
                  className="text-xs font-medium px-2.5 py-1 rounded-full hover:ring-2 hover:ring-offset-1 transition"
                  style={{ backgroundColor: cat.color + '1a', color: cat.color }}
                  title="שינוי קטגוריה"
                >
                  {cat.name}
                </button>
              )}
            </div>

            <div
              className={`shrink-0 w-28 text-left font-bold tabular-nums ${
                isIncome ? 'text-emerald-600' : 'text-ink-900'
              }`}
            >
              {isIncome ? '+' : '−'}
              {formatCurrency(Math.abs(t.amount))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
