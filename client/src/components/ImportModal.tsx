import { useState } from 'react';
import { api } from '../api';

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportModal({ open, onClose, onImported }: Props) {
  const [account, setAccount] = useState('כרטיס אשראי');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!open) return null;

  async function handleFile(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const text = await file.text();
      const res = await api.importCSV(text, account);
      setMsg(`✓ נותחו ${res.parsed} שורות, נוספו ${res.added} תנועות חדשות (סה"כ ${res.total}).`);
      onImported();
    } catch (e) {
      setMsg('שגיאה בייבוא הקובץ. ודא שזהו קובץ CSV תקין.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 shadow-glow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink-50 font-display">ייבוא תנועות מקובץ CSV</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-50 text-xl leading-none">
            ✕
          </button>
        </div>

        <p className="text-sm text-ink-400 mb-4 leading-relaxed">
          ייצא דף תנועות מאתר הבנק או חברת האשראי בפורמט CSV וגרור אותו לכאן. המערכת מזהה
          אוטומטית עמודות של תאריך, תיאור וסכום (עברית/אנגלית) ומסווגת לקטגוריות.
        </p>

        <label className="block eyebrow mb-2">שם החשבון / הכרטיס</label>
        <input
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="w-full mb-4 rounded-xl border border-line bg-surface2/60 px-3 py-2 text-sm text-ink-50 focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400/50 outline-none"
        />

        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-2xl py-10 cursor-pointer hover:border-brand-400/50 hover:bg-brand-400/5 transition">
          <span className="text-3xl">📄</span>
          <span className="text-sm font-medium text-ink-100">
            {busy ? 'מעבד...' : 'בחר קובץ CSV או גרור לכאן'}
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>

        {msg && <div className="mt-4 text-sm font-medium text-ink-100 bg-surface2/60 border border-line rounded-xl p-3 num">{msg}</div>}
      </div>
    </div>
  );
}
