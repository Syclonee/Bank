import type { CategoryAverage } from '../types';
import { formatCurrency } from '../utils/format';

// ממוצע הוצאה חודשי לכל קטגוריה (על פני כל ההיסטוריה).
export default function AveragesPanel({ data }: { data: CategoryAverage[] }) {
  const max = Math.max(...data.map((d) => d.monthlyAvg), 1);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {data.map((c) => (
        <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface2/50 border border-line">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-base shrink-0 border border-line"
            style={{ backgroundColor: c.color + '22', boxShadow: `0 0 16px -8px ${c.color}` }}
          >
            {c.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-100 truncate">{c.name}</span>
              <span className="num text-sm font-bold text-ink-50">{formatCurrency(c.monthlyAvg)}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-bg/80 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(c.monthlyAvg / max) * 100}%`, backgroundColor: c.color, boxShadow: `0 0 10px ${c.color}` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
