import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { TrendPoint } from '../types';
import { formatCurrency, formatMonth } from '../utils/format';

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatMonth(d.month).replace(/ \d{4}$/, ''),
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'Heebo' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Heebo' }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
            orientation="right"
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px -8px rgba(15,23,42,0.2)',
              fontFamily: 'Heebo, sans-serif',
            }}
            cursor={{ fill: 'rgba(99,102,241,0.05)' }}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'Heebo', fontSize: 13, paddingTop: 8 }}
            iconType="circle"
          />
          <Bar dataKey="income" name="הכנסות" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" name="הוצאות" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
