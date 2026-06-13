import type { CategoryAverage } from '../types';
import { formatCurrency } from '../utils/format';

// ממוצע הוצאה חודשי לכל קטגוריה (על פני כל ההיסטוריה).
export default function AveragesPanel({ data }: { data: CategoryAverage[] }) {
  const max = Math.max(...data.map((d) => d.monthlyAvg), 1);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {data.map((c) => (
        <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-base shrink-0"
            style={{ backgroundColor: c.color + '22' }}
          >
            {c.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-700 truncate">{c.name}</span>
              <span className="text-sm font-bold text-ink-900">{formatCurrency(c.monthlyAvg)}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(c.monthlyAvg / max) * 100}%`, backgroundColor: c.color }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
