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
    return <div className="text-center text-ink-500 py-12">לא נמצאו תנועות</div>;
  }

  return (
    <div className="divide-y divide-line/60">
      {transactions.map((t) => {
        const cat = catMap[t.category] || { name: t.category, color: '#a1a1aa', icon: '📦' };
        const isIncome = t.amount > 0;
        return (
          <div key={t.id} className="flex items-center gap-3 py-3 group">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-line"
              style={{ backgroundColor: cat.color + '22', boxShadow: `0 0 16px -9px ${cat.color}` }}
            >
              {cat.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-50 truncate">{t.description || 'ללא תיאור'}</div>
              <div className="text-xs text-ink-500 flex items-center gap-2">
                <span className="num">{formatDate(t.date)}</span>
                <span className="text-ink-600">·</span>
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
                    if (value !== t.category) onChangeCategory(t.id, value);
                    setEditing(null);
                  }}
                  onBlur={() => setTimeout(() => setEditing(null), 150)}
                  className="text-xs rounded-lg border border-line px-2 py-1 bg-surface2 text-ink-50"
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
                  className="text-xs font-medium px-2.5 py-1 rounded-full border transition"
                  style={{ backgroundColor: cat.color + '1f', color: cat.color, borderColor: cat.color + '40' }}
                  title="שינוי קטגוריה"
                >
                  {cat.name}
                </button>
              )}
            </div>

            <div
              className={`shrink-0 w-28 text-left num font-bold ${
                isIncome ? 'text-emerald-300' : 'text-ink-50'
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
