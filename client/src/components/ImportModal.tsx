import { useRef, useState } from 'react';
import { api } from '../api';

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  onCleared: () => void;
}

export default function ImportModal({ open, onClose, onImported, onCleared }: Props) {
  const [account, setAccount] = useState('כרטיס אשראי');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const restoreInput = useRef<HTMLInputElement>(null);

  if (!open) return null;

  async function handleCSV(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const text = await file.text();
      const res = await api.importCSV(text, account);
      setMsg(`✓ נותחו ${res.parsed} שורות, נוספו ${res.added} תנועות חדשות (סה"כ ${res.total}).`);
      onImported();
    } catch {
      setMsg('שגיאה בייבוא הקובץ. ודא שזהו קובץ CSV תקין.');
    } finally {
      setBusy(false);
    }
  }

  async function handleExport() {
    const json = await api.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg('✓ קובץ הגיבוי הורד.');
  }

  async function handleRestore(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const text = await file.text();
      const res = await api.restoreBackup(text);
      setMsg(`✓ שוחזרו ${res.added} תנועות חדשות מהגיבוי (סה"כ ${res.total}).`);
      onImported();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'שחזור נכשל.');
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    await api.clearData();
    setConfirmClear(false);
    setMsg('✓ כל הנתונים נמחקו מהמכשיר.');
    onCleared();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 shadow-glow max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink-50 font-display">ייבוא תנועות וניהול נתונים</h2>
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
            onChange={(e) => e.target.files?.[0] && handleCSV(e.target.files[0])}
          />
        </label>

        {msg && <div className="mt-4 text-sm font-medium text-ink-100 bg-surface2/60 border border-line rounded-xl p-3 num">{msg}</div>}

        {/* גיבוי ושחזור */}
        <div className="mt-6 pt-5 border-t border-line/70">
          <div className="eyebrow mb-1">גיבוי ושחזור</div>
          <p className="text-xs text-ink-400 mb-3 leading-relaxed">
            הנתונים נשמרים על המכשיר בלבד. ייצא גיבוי כדי לשמור עותק או להעביר את הנתונים
            למכשיר אחר, ושחזר אותו שם.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="pill px-4 py-2 text-sm font-semibold text-ink-100 hover:border-brand-400/50 transition"
            >
              ⬇ ייצוא גיבוי
            </button>
            <button
              onClick={() => restoreInput.current?.click()}
              className="pill px-4 py-2 text-sm font-semibold text-ink-100 hover:border-brand-400/50 transition"
            >
              ⬆ שחזור מגיבוי
            </button>
            <input
              ref={restoreInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleRestore(e.target.files[0])}
            />
            <div className="flex-1" />
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <button onClick={handleClear} className="px-3 py-2 text-sm font-semibold rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  אישור מחיקה
                </button>
                <button onClick={() => setConfirmClear(false)} className="px-3 py-2 text-sm text-ink-400">
                  ביטול
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="px-4 py-2 text-sm font-semibold text-rose-300/80 hover:text-rose-300 transition"
              >
                מחיקת כל הנתונים
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
