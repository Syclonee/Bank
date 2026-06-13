// ייבוא תנועות מקובץ CSV (יצוא מבנק/חברת אשראי) ונרמול למבנה אחיד.
import crypto from 'crypto';
import { categorize } from './categories.js';

export function makeHash({ date, amount, description, account }) {
  return crypto
    .createHash('md5')
    .update(`${date}|${amount}|${description}|${account || ''}`)
    .digest('hex');
}

// מנתח תאריך בפורמטים נפוצים. ברירת המחדל בישראל היא יום-תחילה (DD/MM/YYYY).
// מחזיר אובייקט Date תקין או null.
export function parseDate(value) {
  if (value instanceof Date) return isNaN(value) ? null : value;
  if (value == null) return null;
  const str = String(value).trim();
  if (!str) return null;

  // פורמט ISO (YYYY-MM-DD) או עם שעה - JS מנתח נכון
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
    const d = new Date(str);
    return isNaN(d) ? null : d;
  }

  // DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY (יום-תחילה כמקובל בישראל)
  const m = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (m) {
    let day = Number(m[1]);
    let month = Number(m[2]);
    let year = Number(m[3]);
    // אם החלק השני בלבד יכול להיות יום - כנראה פורמט אמריקאי MM/DD, נחליף
    if (month > 12 && day <= 12) {
      [day, month] = [month, day];
    }
    if (year < 100) year += 2000;
    const d = new Date(year, month - 1, day);
    // ולידציה שהתאריך לא "גלש" (למשל 31/02)
    if (isNaN(d) || d.getDate() !== day || d.getMonth() !== month - 1) return null;
    return d;
  }

  const d = new Date(str);
  return isNaN(d) ? null : d;
}

// בונה אובייקט תנועה מנורמל מתוך שדות גולמיים.
export function buildTransaction({ date, amount, description, account, category }) {
  const parsed = parseDate(date);
  if (!parsed) throw new Error(`תאריך לא תקין: ${date}`);
  const normalizedDate = parsed.toISOString().slice(0, 10);
  const amt = Number(amount);
  const desc = (description || '').trim();
  const hash = makeHash({ date: normalizedDate, amount: amt, description: desc, account });
  return {
    id: hash.slice(0, 12),
    hash,
    date: normalizedDate,
    amount: amt,
    description: desc,
    account: account || 'כללי',
    category: category || categorize(desc, amt),
    categoryManual: !!category,
  };
}

// מנתח טקסט CSV. מנסה לזהות עמודות תאריך/סכום/תיאור לפי כותרות נפוצות (עברית/אנגלית).
export function parseCSV(text, account = 'CSV') {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const splitLine = (line) => {
    // תמיכה בסיסית בשדות עטופים במרכאות
    const result = [];
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

  const findCol = (...names) =>
    headers.findIndex((h) => names.some((n) => h.includes(n.toLowerCase())));

  const dateCol = findCol('תאריך', 'date', 'יום ערך');
  const descCol = findCol('תיאור', 'פירוט', 'שם בית עסק', 'בית עסק', 'description', 'merchant', 'details', 'פעולה');
  const amountCol = findCol('סכום', 'סכום חיוב', 'amount', 'debit', 'sum', 'חובה');
  const creditCol = findCol('זכות', 'credit', 'הכנסה');

  const txs = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (cells.length < 2) continue;

    const dateRaw = dateCol >= 0 ? cells[dateCol] : cells[0];
    const desc = descCol >= 0 ? cells[descCol] : cells[1];

    let amount = 0;
    if (amountCol >= 0) {
      amount = parseAmount(cells[amountCol]);
      // בעמודות "חובה/זכות" נפרדות: חובה = הוצאה (שלילי)
      if (creditCol >= 0 && creditCol !== amountCol) {
        const credit = parseAmount(cells[creditCol]);
        if (credit) amount = credit; // זכות = הכנסה חיובית
        else if (amount) amount = -Math.abs(amount); // חובה = הוצאה
      }
    }

    if (!parseDate(dateRaw)) continue;
    if (!amount) continue;

    txs.push(buildTransaction({ date: dateRaw, amount, description: desc, account }));
  }
  return txs;
}

function parseAmount(str) {
  if (!str) return 0;
  // סוגריים מסמנים סכום שלילי בחלק מהיצואים (חשבונאי): (50.00) = -50
  const negative = /^\s*\(.*\)\s*$/.test(str) || str.includes('-');
  const cleaned = str.replace(/[()₪$€,\s]/g, '').replace(/[^\d.]/g, '');
  const n = parseFloat(cleaned);
  if (isNaN(n)) return 0;
  return negative ? -Math.abs(n) : n;
}
