import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryStat } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  data: CategoryStat[];
  totalExpense: number;
}

export default function CategoryDonut({ data, totalExpense }: Props) {
  const chartData = data.slice(0, 8);

  return (
    <div className="relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="total"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            stroke="none"
          >
            {chartData.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px -8px rgba(15,23,42,0.2)',
              fontFamily: 'Heebo, sans-serif',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs text-ink-400 font-medium">סך הוצאות</span>
        <span className="text-2xl font-extrabold text-ink-900">{formatCurrency(totalExpense)}</span>
      </div>
    </div>
  );
}
