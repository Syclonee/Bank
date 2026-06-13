// שכבת נתונים מקומית - רצה כולה בדפדפן (ללא שרת). הנתונים נשמרים ב-IndexedDB.
import type { DashboardData, Transaction, Category } from './types';
import { CATEGORIES } from './lib/categories';
import { parseCSV } from './lib/importer';
import {
  getTransactions,
  upsertTransactions,
  updateTransactionCategory,
  saveTransactions,
  clearTransactions,
} from './lib/store';
import {
  summary,
  byCategory,
  monthlyAveragesByCategory,
  monthlyTrend,
  filterByMonth,
  listMonths,
} from './lib/analytics';
import { generateDemo } from './lib/demo';

export const api = {
  async dashboard(month: string): Promise<DashboardData> {
    const all = await getTransactions();
    const scoped = filterByMonth(all, month);
    return {
      month,
      months: listMonths(all),
      summary: summary(scoped),
      categories: byCategory(scoped),
      monthlyAverages: monthlyAveragesByCategory(all),
      trend: monthlyTrend(all),
    };
  },

  async categories(): Promise<Category[]> {
    return CATEGORIES;
  },

  async transactions(params: {
    month?: string;
    category?: string;
    q?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    let txs = await getTransactions();
    if (params.month && params.month !== 'all') txs = filterByMonth(txs, params.month);
    if (params.category && params.category !== 'all') txs = txs.filter((t) => t.category === params.category);
    if (params.q) {
      const needle = params.q.toLowerCase();
      txs = txs.filter((t) => t.description.toLowerCase().includes(needle));
    }
    if (params.limit) txs = txs.slice(0, params.limit);
    return txs;
  },

  async updateCategory(id: string, category: string) {
    return updateTransactionCategory(id, category);
  },

  async importCSV(csv: string, account: string) {
    const parsed = parseCSV(csv, account);
    const result = await upsertTransactions(parsed);
    return { parsed: parsed.length, ...result };
  },

  // טעינת נתוני דמו (מחליף את הקיימים)
  async loadDemo() {
    const demo = generateDemo();
    await saveTransactions(demo);
    return { total: demo.length };
  },

  // ייצוא כל הנתונים כמחרוזת JSON (לגיבוי / העברה בין מכשירים)
  async exportBackup(): Promise<string> {
    const transactions = await getTransactions();
    return JSON.stringify(
      { app: 'nova', version: 1, exportedAt: new Date().toISOString(), transactions },
      null,
      2
    );
  },

  // שחזור מגיבוי - ממזג עם הקיים (מניעת כפילויות לפי hash)
  async restoreBackup(text: string) {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('קובץ גיבוי לא תקין');
    }
    const txs = (data as { transactions?: Transaction[] })?.transactions;
    if (!Array.isArray(txs)) throw new Error('קובץ הגיבוי אינו בפורמט הצפוי');
    const valid = txs.filter((t) => t && t.hash && t.date && typeof t.amount === 'number');
    const result = await upsertTransactions(valid);
    return { restored: valid.length, ...result };
  },

  async clearData() {
    await clearTransactions();
  },
};
