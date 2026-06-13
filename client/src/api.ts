import type { DashboardData, Transaction, Category } from './types';

const BASE = '/api';

async function get<T>(url: string): Promise<T> {
  const res = await fetch(BASE + url);
  if (!res.ok) throw new Error(`שגיאה בטעינה: ${res.status}`);
  return res.json();
}

export const api = {
  dashboard: (month: string) => get<DashboardData>(`/dashboard?month=${encodeURIComponent(month)}`),

  categories: () => get<Category[]>(`/categories`),

  transactions: (params: { month?: string; category?: string; q?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params.month) qs.set('month', params.month);
    if (params.category) qs.set('category', params.category);
    if (params.q) qs.set('q', params.q);
    if (params.limit) qs.set('limit', String(params.limit));
    return get<Transaction[]>(`/transactions?${qs.toString()}`);
  },

  updateCategory: async (id: string, category: string) => {
    const res = await fetch(`${BASE}/transactions/${id}/category`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });
    if (!res.ok) throw new Error('עדכון נכשל');
    return res.json();
  },

  importCSV: async (csv: string, account: string) => {
    const res = await fetch(`${BASE}/import/csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv, account }),
    });
    if (!res.ok) throw new Error('ייבוא נכשל');
    return res.json() as Promise<{ parsed: number; added: number; total: number }>;
  },

  scrapeStatus: () => get<{ available: boolean }>(`/scrape/status`),
};
