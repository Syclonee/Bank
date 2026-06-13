import type { CategoryStat } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  data: CategoryStat[];
  onSelect?: (id: string) => void;
}

// רשימת קטגוריות עם סכום, מספר תנועות, ממוצע לתנועה ופס התקדמות.
export default function CategoryList({ data, onSelect }: Props) {
  if (!data.length) {
    return <div className="text-center text-ink-400 py-10">אין הוצאות בתקופה זו</div>;
  }
  return (
    <div className="space-y-1">
      {data.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect?.(c.id)}
          className="w-full text-right flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
        >
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: c.color + '1a' }}
          >
            {c.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink-900 truncate">{c.name}</span>
              <span className="font-bold text-ink-900 shrink-0">{formatCurrency(c.total)}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(c.percent, 2)}%`, backgroundColor: c.color }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-ink-400">
              <span>
                {c.count} תנועות · ממוצע {formatCurrency(c.avg)}
              </span>
              <span>{c.percent}%</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
