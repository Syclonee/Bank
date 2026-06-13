// שרת Express - קריאה בלבד. מספק API לדשבורד, ייבוא CSV, וגירוד אופציונלי.
import express from 'express';
import cors from 'cors';
import {
  readTransactions,
  upsertTransactions,
  updateTransactionCategory,
  clearTransactions,
} from './db.js';
import { parseCSV } from './importer.js';
import {
  summary,
  byCategory,
  monthlyAveragesByCategory,
  monthlyTrend,
  filterByMonth,
  listMonths,
  allCategories,
} from './analytics.js';
import { scrapeAccount, isScraperAvailable } from './scraper.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: 'text/csv', limit: '10mb' }));

// בריאות
app.get('/api/health', (req, res) => res.json({ ok: true }));

// רשימת קטגוריות
app.get('/api/categories', (req, res) => res.json(allCategories()));

// רשימת חודשים זמינים
app.get('/api/months', (req, res) => {
  res.json(listMonths(readTransactions()));
});

// כל הנתונים לדשבורד עבור חודש מסוים (?month=YYYY-MM או all)
app.get('/api/dashboard', (req, res) => {
  const all = readTransactions();
  const month = req.query.month || 'all';
  const scoped = filterByMonth(all, month);
  res.json({
    month,
    months: listMonths(all),
    summary: summary(scoped),
    categories: byCategory(scoped),
    monthlyAverages: monthlyAveragesByCategory(all),
    trend: monthlyTrend(all),
  });
});

// תנועות עם סינון (?month, ?category, ?q, ?limit)
app.get('/api/transactions', (req, res) => {
  let txs = readTransactions();
  const { month, category, q, limit } = req.query;
  if (month && month !== 'all') txs = filterByMonth(txs, month);
  if (category && category !== 'all') txs = txs.filter((t) => t.category === category);
  if (q) {
    const needle = q.toLowerCase();
    txs = txs.filter((t) => t.description.toLowerCase().includes(needle));
  }
  if (limit) txs = txs.slice(0, Number(limit));
  res.json(txs);
});

// עדכון קטגוריה ידני
app.patch('/api/transactions/:id/category', (req, res) => {
  const { category } = req.body;
  const updated = updateTransactionCategory(req.params.id, category);
  if (!updated) return res.status(404).json({ error: 'תנועה לא נמצאה' });
  res.json(updated);
});

// ייבוא CSV
app.post('/api/import/csv', (req, res) => {
  try {
    const csvText = typeof req.body === 'string' ? req.body : req.body.csv;
    const account = (req.body && req.body.account) || 'CSV';
    if (!csvText) return res.status(400).json({ error: 'לא התקבל תוכן CSV' });
    const parsed = parseCSV(csvText, account);
    const result = upsertTransactions(parsed);
    res.json({ parsed: parsed.length, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// סטטוס זמינות גירוד בנקים
app.get('/api/scrape/status', async (req, res) => {
  res.json({ available: await isScraperAvailable() });
});

// גירוד חשבון אמיתי (קריאה בלבד). פרטי ההתחברות לא נשמרים.
app.post('/api/scrape', async (req, res) => {
  try {
    const { companyId, credentials, startDate } = req.body;
    if (!companyId || !credentials) {
      return res.status(400).json({ error: 'חסר companyId או credentials' });
    }
    const txs = await scrapeAccount({ companyId, credentials, startDate });
    const result = upsertTransactions(txs);
    res.json({ scraped: txs.length, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// איפוס נתונים
app.delete('/api/transactions', (req, res) => {
  clearTransactions();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✓ שרת מעקב הוצאות פועל על http://localhost:${PORT}`);
});
