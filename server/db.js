// אחסון מקומי פשוט מבוסס קובץ JSON. אין תלות חיצונית, הנתונים נשארים על המחשב.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const TX_FILE = path.join(DATA_DIR, 'transactions.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readTransactions() {
  ensureDir();
  if (!fs.existsSync(TX_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TX_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function writeTransactions(transactions) {
  ensureDir();
  fs.writeFileSync(TX_FILE, JSON.stringify(transactions, null, 2), 'utf-8');
}

// מוסיף תנועות חדשות תוך מניעת כפילויות לפי hash (תאריך+סכום+תיאור+חשבון).
export function upsertTransactions(newTxs) {
  const existing = readTransactions();
  const seen = new Set(existing.map((t) => t.hash));
  let added = 0;
  for (const tx of newTxs) {
    if (!seen.has(tx.hash)) {
      existing.push(tx);
      seen.add(tx.hash);
      added++;
    }
  }
  existing.sort((a, b) => new Date(b.date) - new Date(a.date));
  writeTransactions(existing);
  return { added, total: existing.length };
}

// עדכון קטגוריה ידנית לתנועה בודדת.
export function updateTransactionCategory(id, category) {
  const txs = readTransactions();
  const tx = txs.find((t) => t.id === id);
  if (!tx) return null;
  tx.category = category;
  tx.categoryManual = true;
  writeTransactions(txs);
  return tx;
}

export function clearTransactions() {
  writeTransactions([]);
}
