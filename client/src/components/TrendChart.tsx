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
        <BarChart data={formatted} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barGap={5}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" stopOpacity={1} />
              <stop offset="100%" stopColor="#e11d48" stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#1c2742" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#94a3b8', fontFamily: 'Heebo' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
            orientation="right"
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #1c2742',
              background: 'rgba(12,19,34,0.95)',
              boxShadow: '0 0 24px -8px rgba(34,211,238,0.4)',
              fontFamily: 'Heebo, sans-serif',
            }}
            itemStyle={{ color: '#e2e8f0' }}
            labelStyle={{ color: '#94a3b8' }}
            cursor={{ fill: 'rgba(34,211,238,0.06)' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'Heebo', fontSize: 13, paddingTop: 8, color: '#94a3b8' }} iconType="circle" />
          <Bar dataKey="income" name="הכנסות" fill="url(#incomeGrad)" radius={[6, 6, 0, 0]} maxBarSize={26} />
          <Bar dataKey="expense" name="הוצאות" fill="url(#expenseGrad)" radius={[6, 6, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
