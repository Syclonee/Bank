import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryStat } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  data: CategoryStat[];
  totalExpense: number;
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #1c2742',
  background: 'rgba(12,19,34,0.95)',
  boxShadow: '0 0 24px -8px rgba(34,211,238,0.4)',
  fontFamily: 'Heebo, sans-serif',
  color: '#e2e8f0',
};

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
            innerRadius={72}
            outerRadius={102}
            paddingAngle={3}
            stroke="#0c1322"
            strokeWidth={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            contentStyle={tooltipStyle}
            itemStyle={{ color: '#e2e8f0' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="eyebrow">סך הוצאות</span>
        <span className="num text-2xl font-bold text-ink-50 mt-1">{formatCurrency(totalExpense)}</span>
      </div>
    </div>
  );
}
