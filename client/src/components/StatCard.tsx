import { formatCurrency } from '../utils/format';

interface Props {
  label: string;
  value: number;
  icon: string;
  tone: 'income' | 'expense' | 'balance' | 'savings';
  isPercent?: boolean;
}

const TONES: Record<Props['tone'], { text: string; glow: string; bar: string }> = {
  income: { text: 'text-emerald-300', glow: 'shadow-[0_0_24px_-10px_rgba(52,211,153,0.7)]', bar: 'from-emerald-400/80' },
  expense: { text: 'text-rose-300', glow: 'shadow-[0_0_24px_-10px_rgba(251,113,133,0.7)]', bar: 'from-rose-400/80' },
  balance: { text: 'text-brand-300', glow: 'shadow-[0_0_24px_-10px_rgba(34,211,238,0.7)]', bar: 'from-brand-400/80' },
  savings: { text: 'text-accent-400', glow: 'shadow-[0_0_24px_-10px_rgba(168,85,247,0.7)]', bar: 'from-accent-400/80' },
};

export default function StatCard({ label, value, icon, tone, isPercent }: Props) {
  const t = TONES[tone];
  return (
    <div className="card relative overflow-hidden p-5">
      {/* קו זוהר עליון */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-l ${t.bar} to-transparent`} />
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <div className={`h-9 w-9 rounded-xl border border-line bg-surface2/80 flex items-center justify-center text-base ${t.text} ${t.glow}`}>
          {icon}
        </div>
      </div>
      <div className={`mt-3 num text-[26px] font-bold tracking-tight ${tone === 'balance' && value < 0 ? 'text-rose-300' : 'text-ink-50'}`}>
        {isPercent ? `${value}%` : formatCurrency(value)}
      </div>
    </div>
  );
}
