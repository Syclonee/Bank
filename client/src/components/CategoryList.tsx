import type { CategoryStat } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  data: CategoryStat[];
  onSelect?: (id: string) => void;
}

// רשימת קטגוריות עם סכום, מספר תנועות, ממוצע לתנועה ופס התקדמות זוהר.
export default function CategoryList({ data, onSelect }: Props) {
  if (!data.length) {
    return <div className="text-center text-ink-500 py-10">אין הוצאות בתקופה זו</div>;
  }
  return (
    <div className="space-y-1">
      {data.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect?.(c.id)}
          className="w-full text-right flex items-center gap-3 p-3 rounded-2xl hover:bg-surface2/60 border border-transparent hover:border-line transition-colors"
        >
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-line"
            style={{ backgroundColor: c.color + '22', boxShadow: `0 0 18px -8px ${c.color}` }}
          >
            {c.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink-50 truncate">{c.name}</span>
              <span className="num font-bold text-ink-50 shrink-0">{formatCurrency(c.total)}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-surface2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(c.percent, 2)}%`, backgroundColor: c.color, boxShadow: `0 0 10px ${c.color}` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-ink-500">
              <span className="num">
                {c.count} תנועות · ממוצע {formatCurrency(c.avg)}
              </span>
              <span className="num text-ink-400">{c.percent}%</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
