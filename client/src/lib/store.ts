// אחסון מקומי בדפדפן (IndexedDB) - הנתונים נשמרים על המכשיר ולא עוזבים אותו.
import type { Transaction } from '../types';

const DB_NAME = 'nova-db';
const STORE = 'kv';
const KEY = 'transactions';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getTransactions(): Promise<Transaction[]> {
  const data = await idbGet<Transaction[]>(KEY);
  return data || [];
}

export async function saveTransactions(txs: Transaction[]): Promise<void> {
  await idbSet(KEY, txs);
}

// הוספת תנועות חדשות תוך מניעת כפילויות לפי hash.
export async function upsertTransactions(
  newTxs: Transaction[]
): Promise<{ added: number; total: number }> {
  const existing = await getTransactions();
  const seen = new Set(existing.map((t) => t.hash));
  let added = 0;
  for (const tx of newTxs) {
    if (!seen.has(tx.hash)) {
      existing.push(tx);
      seen.add(tx.hash);
      added++;
    }
  }
  existing.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  await saveTransactions(existing);
  return { added, total: existing.length };
}

export async function updateTransactionCategory(
  id: string,
  category: string
): Promise<Transaction | null> {
  const txs = await getTransactions();
  const tx = txs.find((t) => t.id === id);
  if (!tx) return null;
  tx.category = category;
  tx.categoryManual = true;
  await saveTransactions(txs);
  return tx;
}

export async function clearTransactions(): Promise<void> {
  await saveTransactions([]);
}
