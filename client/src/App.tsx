import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import type { Category, DashboardData, Transaction } from './types';
import { formatCurrency, formatMonth, greeting } from './utils/format';
import StatCard from './components/StatCard';
import CategoryDonut from './components/CategoryDonut';
import CategoryList from './components/CategoryList';
import TrendChart from './components/TrendChart';
import AveragesPanel from './components/AveragesPanel';
import TransactionsTable from './components/TransactionsTable';
import ImportModal from './components/ImportModal';

type View = 'overview' | 'transactions' | 'averages';

const NAV: { id: View; label: string; icon: string }[] = [
  { id: 'overview', label: 'סקירה כללית', icon: '📊' },
  { id: 'transactions', label: 'תנועות', icon: '🧾' },
  { id: 'averages', label: 'ממוצעים', icon: '📈' },
];

export default function App() {
  const [view, setView] = useState<View>('overview');
  const [month, setMonth] = useState<string>('all');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [importOpen, setImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadDashboard(m: string) {
    setLoading(true);
    try {
      const data = await api.dashboard(m);
      setDashboard(data);
    } finally {
      setLoading(false);
    }
  }

  // מזהה בקשה עולה: תשובות שמגיעות מחוץ לסדר (בקשה ישנה שהסתיימה מאוחר) נזרקות,
  // כדי שהטבלה תמיד תשקף את הסינון/החיפוש הנוכחי.
  const txReqId = useRef(0);

  async function loadTransactions() {
    const reqId = ++txReqId.current;
    const data = await api.transactions({
      month,
      category: catFilter,
      q: query,
      limit: 300,
    });
    if (reqId === txReqId.current) setTransactions(data);
  }

  useEffect(() => {
    api.categories().then(setCategories);
  }, []);

  useEffect(() => {
    loadDashboard(month);
  }, [month]);

  // טעינת תנועות עם debounce - מונע ירי בקשה על כל הקשה בתיבת החיפוש.
  useEffect(() => {
    if (view !== 'transactions') return;
    const t = setTimeout(loadTransactions, 250);
    return () => clearTimeout(t);
  }, [view, month, catFilter, query]);

  async function handleChangeCategory(id: string, category: string) {
    await api.updateCategory(id, category);
    await loadTransactions();
    await loadDashboard(month);
  }

  function afterImport() {
    loadDashboard(month);
    if (view === 'transactions') loadTransactions();
  }

  async function handleLoadDemo() {
    await api.loadDemo();
    setMonth('all');
    await loadDashboard('all');
    if (view === 'transactions') loadTransactions();
  }

  async function handleCleared() {
    setMonth('all');
    await loadDashboard('all');
    if (view === 'transactions') loadTransactions();
  }

  const months = dashboard?.months ?? [];

  return (
    <div className="min-h-screen flex">
      {/* סרגל צד */}
      <aside className="w-64 shrink-0 border-l border-line/70 bg-surface/60 backdrop-blur-xl p-5 hidden md:flex flex-col gap-2">
        <div className="flex items-center gap-3 px-1 mb-7">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-bg flex items-center justify-center font-display font-bold text-lg shadow-glow">
            ₪
          </div>
          <div>
            <div className="font-display font-bold text-ink-50 leading-tight tracking-wide">NOVA</div>
            <div className="eyebrow">finance os</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition ${
                view === n.id
                  ? 'bg-brand-400/10 text-brand-300 border border-brand-400/30 shadow-glow'
                  : 'text-ink-400 hover:bg-surface2/60 hover:text-ink-100 border border-transparent'
              }`}
            >
              <span className="text-lg">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setImportOpen(true)}
            className="w-full bg-gradient-to-l from-brand-400 to-accent-500 text-bg font-bold rounded-2xl py-2.5 text-sm transition hover:opacity-90 shadow-glow"
          >
            ＋ ייבוא תנועות
          </button>
          <p className="text-[11px] text-ink-500 mt-3 leading-relaxed px-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle ml-1 shadow-[0_0_8px_#34d399]" />
            קריאה בלבד · הנתונים נשמרים מקומית במחשב שלך בלבד
          </p>
        </div>
      </aside>

      {/* תוכן ראשי */}
      <main className="flex-1 min-w-0">
        {/* כותרת עליונה */}
        <header className="sticky top-0 z-20 bg-bg/70 backdrop-blur-xl px-5 md:px-8 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-line/70">
          <div>
            <div className="eyebrow mb-0.5">dashboard</div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-ink-50">
              {greeting()} 👋
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="pill px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-brand-400/40 outline-none"
            >
              <option value="all">כל התקופה</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
            <button
              onClick={() => setImportOpen(true)}
              className="md:hidden bg-gradient-to-l from-brand-400 to-accent-500 text-bg font-bold rounded-xl px-3 py-2 text-sm"
            >
              ＋
            </button>
          </div>
        </header>

        <div className="p-5 md:p-8 pb-28 md:pb-8">
          {loading && !dashboard ? (
            <div className="text-center text-ink-500 py-20 num">טוען נתונים...</div>
          ) : !dashboard || (dashboard.summary.count === 0 && month === 'all') ? (
            <EmptyState onImport={() => setImportOpen(true)} onLoadDemo={handleLoadDemo} />
          ) : (
            <>
              {view === 'overview' && dashboard && (
                <Overview dashboard={dashboard} onSelectCategory={(id) => {
                  setCatFilter(id);
                  setView('transactions');
                }} />
              )}

              {view === 'transactions' && (
                <TransactionsView
                  transactions={transactions}
                  categories={categories}
                  query={query}
                  setQuery={setQuery}
                  catFilter={catFilter}
                  setCatFilter={setCatFilter}
                  onChangeCategory={handleChangeCategory}
                />
              )}

              {view === 'averages' && dashboard && (
                <AveragesView dashboard={dashboard} />
              )}
            </>
          )}
        </div>
      </main>

      {/* ניווט תחתון - נייד בלבד */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line/70 bg-bg/90 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-around">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                view === n.id ? 'text-brand-300' : 'text-ink-500'
              }`}
            >
              <span className={`text-lg ${view === n.id ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}`}>{n.icon}</span>
              {n.label}
            </button>
          ))}
          <button
            onClick={() => setImportOpen(true)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold text-accent-400"
          >
            <span className="text-lg">＋</span>
            ייבוא
          </button>
        </div>
      </nav>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={afterImport}
        onCleared={handleCleared}
      />
    </div>
  );
}

function Overview({
  dashboard,
  onSelectCategory,
}: {
  dashboard: DashboardData;
  onSelectCategory: (id: string) => void;
}) {
  const { summary, categories, trend } = dashboard;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="הכנסות" value={summary.income} icon="↘" tone="income" />
        <StatCard label="הוצאות" value={summary.expense} icon="↗" tone="expense" />
        <StatCard label="מאזן" value={summary.balance} icon="₪" tone="balance" />
        <StatCard label="אחוז חיסכון" value={summary.savingsRate} icon="🎯" tone="savings" isPercent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-ink-50">מגמה חודשית</h2>
            <span className="eyebrow">income / expense</span>
          </div>
          <TrendChart data={trend} />
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display font-bold text-ink-50 mb-2">פילוח הוצאות</h2>
          <CategoryDonut data={categories} totalExpense={summary.expense} />
        </section>
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-ink-50">הוצאות לפי קטגוריה</h2>
          <span className="eyebrow">tap to filter</span>
        </div>
        <CategoryList data={categories} onSelect={onSelectCategory} />
      </section>
    </div>
  );
}

function TransactionsView({
  transactions,
  categories,
  query,
  setQuery,
  catFilter,
  setCatFilter,
  onChangeCategory,
}: {
  transactions: Transaction[];
  categories: Category[];
  query: string;
  setQuery: (s: string) => void;
  catFilter: string;
  setCatFilter: (s: string) => void;
  onChangeCategory: (id: string, category: string) => void;
}) {
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 חיפוש בית עסק..."
          className="flex-1 min-w-[180px] rounded-xl border border-line bg-surface2/60 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-500 focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400/50 outline-none"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="pill px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-brand-400/40 outline-none"
        >
          <option value="all">כל הקטגוריות</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>
      <TransactionsTable
        transactions={transactions}
        categories={categories}
        onChangeCategory={onChangeCategory}
      />
    </div>
  );
}

function AveragesView({ dashboard }: { dashboard: DashboardData }) {
  const numMonths = dashboard.trend.length || 1;
  const totalMonthlyAvg = useMemo(
    () => dashboard.monthlyAverages.reduce((s, c) => s + c.monthlyAvg, 0),
    [dashboard]
  );
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-bold text-ink-50">הוצאה חודשית ממוצעת לכל קטגוריה</h2>
          <span className="num text-sm font-bold text-brand-300">
            סה"כ {formatCurrency(totalMonthlyAvg)} / חודש
          </span>
        </div>
        <p className="eyebrow mb-5">
          avg over {numMonths} months
        </p>
        <AveragesPanel data={dashboard.monthlyAverages} />
      </div>
    </div>
  );
}

function EmptyState({ onImport, onLoadDemo }: { onImport: () => void; onLoadDemo: () => void }) {
  return (
    <div className="card p-12 text-center max-w-xl mx-auto mt-10 shadow-glow">
      <div className="text-5xl mb-4">📊</div>
      <h2 className="text-xl font-display font-bold text-ink-50 mb-2">אין עדיין נתונים</h2>
      <p className="text-ink-400 mb-6 leading-relaxed">
        ייבא קובץ CSV מהבנק או מכרטיס האשראי כדי להתחיל לעקוב, או טען נתוני דמו כדי
        להתרשם מהדשבורד. כל המידע נשמר על המכשיר שלך בלבד.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onImport}
          className="bg-gradient-to-l from-brand-400 to-accent-500 text-bg font-bold rounded-2xl px-6 py-3 transition hover:opacity-90 shadow-glow"
        >
          ＋ ייבוא תנועות
        </button>
        <button
          onClick={onLoadDemo}
          className="pill px-6 py-3 font-semibold text-ink-100 hover:border-brand-400/50 transition"
        >
          טען נתוני דמו
        </button>
      </div>
    </div>
  );
}
