// ייבוא וניתוח CSV בצד-הלקוח + נרמול תנועות.
import type { Transaction } from '../types';
import { categorize } from './categories';

// hash דטרמיניסטי ללא תלות חיצונית (לזיהוי כפילויות). שני גיבובים = 16 תווי hex.
function hashStr(s: string): string {
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = (Math.imul(h1, 33) + c) | 0;
    h2 = (Math.imul(h2, 33) ^ c) | 0;
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

export function makeHash(date: string, amount: number, description: string, account: string): string {
  return hashStr(`${date}|${amount}|${description}|${account || ''}`);
}

// מנתח תאריך בפורמטים נפוצים. ברירת מחדל בישראל: יום-תחילה (DD/MM/YYYY).
export function parseDate(value: string | Date | null | undefined): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (value == null) return null;
  const str = String(value).trim();
  if (!str) return null;

  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  const m = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (m) {
    let day = Number(m[1]);
    let month = Number(m[2]);
    let year = Number(m[3]);
    if (month > 12 && day <= 12) {
      [day, month] = [month, day];
    }
    if (year < 100) year += 2000;
    const d = new Date(year, month - 1, day);
    if (isNaN(d.getTime()) || d.getDate() !== day || d.getMonth() !== month - 1) return null;
    return d;
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function buildTransaction(input: {
  date: string | Date;
  amount: number;
  description?: string;
  account?: string;
  category?: string;
}): Transaction {
  const parsed = parseDate(input.date);
  if (!parsed) throw new Error(`תאריך לא תקין: ${input.date}`);
  const normalizedDate = parsed.toISOString().slice(0, 10);
  const amt = Number(input.amount);
  const desc = (input.description || '').trim();
  const account = input.account || 'כללי';
  const hash = makeHash(normalizedDate, amt, desc, account);
  return {
    id: hash.slice(0, 12),
    hash,
    date: normalizedDate,
    amount: amt,
    description: desc,
    account,
    category: input.category || categorize(desc, amt),
    categoryManual: !!input.category,
  };
}

function parseAmount(str: string): number {
  if (!str) return 0;
  const negative = /^\s*\(.*\)\s*$/.test(str) || str.includes('-');
  const cleaned = str.replace(/[()₪$€,\s]/g, '').replace(/[^\d.]/g, '');
  const n = parseFloat(cleaned);
  if (isNaN(n)) return 0;
  return negative ? -Math.abs(n) : n;
}

// מנתח טקסט CSV ומחזיר תנועות מנורמלות. מזהה עמודות לפי כותרות (עברית/אנגלית).
export function parseCSV(text: string, account = 'CSV'): Transaction[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === delimiter && !inQuotes) {
        result.push(cur);
        cur = '';
      } else cur += ch;
    }
    result.push(cur);
    return result.map((c) => c.trim().replace(/^"|"$/g, ''));
  };

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());
  const findCol = (...names: string[]) =>
    headers.findIndex((h) => names.some((n) => h.includes(n.toLowerCase())));

  const dateCol = findCol('תאריך', 'date', 'יום ערך');
  const descCol = findCol('תיאור', 'פירוט', 'שם בית עסק', 'בית עסק', 'description', 'merchant', 'details', 'פעולה');
  const amountCol = findCol('סכום', 'סכום חיוב', 'amount', 'debit', 'sum', 'חובה');
  const creditCol = findCol('זכות', 'credit', 'הכנסה');

  const txs: Transaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (cells.length < 2) continue;

    const dateRaw = dateCol >= 0 ? cells[dateCol] : cells[0];
    const desc = descCol >= 0 ? cells[descCol] : cells[1];

    let amount = 0;
    if (amountCol >= 0) {
      amount = parseAmount(cells[amountCol]);
      if (creditCol >= 0 && creditCol !== amountCol) {
        const credit = parseAmount(cells[creditCol]);
        if (credit) amount = credit;
        else if (amount) amount = -Math.abs(amount);
      }
    }

    if (!parseDate(dateRaw)) continue;
    if (!amount) continue;

    txs.push(buildTransaction({ date: dateRaw, amount, description: desc, account }));
  }
  return txs;
}
