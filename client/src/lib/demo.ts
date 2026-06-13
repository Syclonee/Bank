// יוצר נתוני דמו ריאליסטיים (6 חודשים) כדי לראות את הדשבורד מלא.
import type { Transaction } from '../types';
import { buildTransaction } from './importer';

const MERCHANTS: Record<string, string[]> = {
  groceries: ['שופרסל דיל', 'רמי לוי', 'יוחננוף', 'ויקטורי', 'אושר עד', 'טיב טעם', 'am:pm'],
  dining: ['קפה ארומה', 'מקדונלדס', 'פיצה האט', 'Wolt משלוח', 'רולדין', 'סושי בר', 'לנדוור'],
  transport: ['פז דלק', 'סונול', 'רב קו', 'Gett מונית', 'Pango חניה', 'דור אלון', 'כביש 6'],
  housing: ['חברת חשמל', 'תאגיד מים', 'בזק', 'HOT', 'סלקום', 'ארנונה עיריית ת"א', 'פזגז'],
  shopping: ['קסטרו', 'FOX', 'IKEA', 'ACE', 'Terminal X', 'מקס סטוק', 'AliExpress'],
  health: ['סופר פארם', 'בית מרקחת כללית', 'מכבי שירותי בריאות', 'רופא שיניים'],
  entertainment: ['Netflix', 'Spotify', 'יס פלאנט', 'חדר כושר הולמס פלייס', 'Apple.com', 'YouTube Premium'],
  education: ['חוג שחייה', 'צהרון', 'סטימצקי', 'Udemy'],
  travel: ['Booking.com', 'אל על', 'Airbnb', 'מלון רימונים'],
  finance: ['עמלת ניהול חשבון', 'ביטוח הראל', 'דמי כרטיס אשראי'],
  transfer: ['העברת bit', 'משיכת כספומט', 'PayBox', 'הוראת קבע'],
};

const RANGES: Record<string, [number, number]> = {
  groceries: [60, 480], dining: [25, 180], transport: [15, 300], housing: [100, 900],
  shopping: [50, 600], health: [20, 350], entertainment: [20, 220], education: [150, 900],
  travel: [300, 2800], finance: [10, 150], transfer: [50, 700],
};

const FREQ: Record<string, number> = {
  groceries: 8, dining: 7, transport: 6, housing: 4, shopping: 3, health: 2,
  entertainment: 4, education: 1, travel: 0.4, finance: 2, transfer: 2,
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function generateDemo(): Transaction[] {
  const txs: Transaction[] = [];
  const now = new Date();
  const MONTHS = 6;

  for (let m = MONTHS - 1; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const salary = 18500 + Math.round(rand(-400, 900));
    txs.push(buildTransaction({ date: new Date(year, month, 1), amount: salary, description: 'משכורת - חברת הייטק בע"מ', account: 'עו"ש', category: 'income' }));

    if (Math.random() > 0.5) {
      txs.push(buildTransaction({ date: new Date(year, month, Math.floor(rand(5, 20))), amount: Math.round(rand(300, 1500)), description: pick(['החזר ביטוח לאומי', 'זיכוי החזר', 'העברה מחבר']), account: 'עו"ש', category: 'income' }));
    }

    for (const [cat, freq] of Object.entries(FREQ)) {
      const count = Math.random() < freq % 1 ? Math.floor(freq) + 1 : Math.floor(freq);
      for (let i = 0; i < count; i++) {
        const [lo, hi] = RANGES[cat];
        const amount = -Math.round(rand(lo, hi));
        const day = Math.floor(rand(1, daysInMonth + 1));
        txs.push(buildTransaction({ date: new Date(year, month, day), amount, description: pick(MERCHANTS[cat]), account: pick(['עו"ש', 'ויזה כאל', 'מאסטרקארד מקס']), category: cat }));
      }
    }
  }

  txs.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return txs;
}
