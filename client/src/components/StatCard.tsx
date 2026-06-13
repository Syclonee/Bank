import { formatCurrency } from '../utils/format';

interface Props {
  label: string;
  value: number;
  icon: string;
  tone: 'income' | 'expense' | 'balance' | 'savings';
  suffix?: string;
  isPercent?: boolean;
}

const TONES: Record<Props['tone'], { bg: string; text: string; ring: string }> = {
  income: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  expense: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
  balance: { bg: 'bg-brand-50', text: 'text-brand-600', ring: 'ring-brand-100' },
  savings: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
};

export default function StatCard({ label, value, icon, tone, isPercent }: Props) {
  const t = TONES[tone];
  return (
    <div className="card p-5 flex items-center gap-4">
      <div
        className={`h-12 w-12 rounded-2xl ${t.bg} ${t.text} ring-4 ${t.ring} flex items-center justify-center text-xl shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-ink-500 font-medium">{label}</div>
        <div className={`text-2xl font-extrabold tracking-tight ${tone === 'balance' && value < 0 ? 'text-rose-600' : 'text-ink-900'}`}>
          {isPercent ? `${value}%` : formatCurrency(value)}
        </div>
      </div>
    </div>
  );
}
