// יוצר נתוני דמו ריאליסטיים (כ-6 חודשים) כדי שהדשבורד ייראה מלא ויפה מיד.
import { buildTransaction } from './importer.js';
import { writeTransactions } from './db.js';

const MERCHANTS = {
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

// טווחי סכומים אופייניים (הוצאה) לכל קטגוריה
const RANGES = {
  groceries: [60, 480],
  dining: [25, 180],
  transport: [15, 300],
  housing: [100, 900],
  shopping: [50, 600],
  health: [20, 350],
  entertainment: [20, 220],
  education: [150, 900],
  travel: [300, 2800],
  finance: [10, 150],
  transfer: [50, 700],
};

// כמה תנועות בחודש בערך לכל קטגוריה
const FREQ = {
  groceries: 8,
  dining: 7,
  transport: 6,
  housing: 4,
  shopping: 3,
  health: 2,
  entertainment: 4,
  education: 1,
  travel: 0.4,
  finance: 2,
  transfer: 2,
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generate() {
  const txs = [];
  const now = new Date();
  const MONTHS = 6;

  for (let m = MONTHS - 1; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // משכורת חודשית בתחילת החודש
    const salary = 18500 + Math.round(rand(-400, 900));
    txs.push(
      buildTransaction({
        date: new Date(year, month, 1).toISOString(),
        amount: salary,
        description: 'משכורת - חברת הייטק בע"מ',
        account: 'עו"ש',
        category: 'income',
      })
    );

    // הכנסה צדדית מדי פעם
    if (Math.random() > 0.5) {
      txs.push(
        buildTransaction({
          date: new Date(year, month, Math.floor(rand(5, 20))).toISOString(),
          amount: Math.round(rand(300, 1500)),
          description: pick(['החזר ביטוח לאומי', 'זיכוי החזר', 'העברה מחבר']),
          account: 'עו"ש',
          category: 'income',
        })
      );
    }

    // הוצאות לפי קטגוריות
    for (const [cat, freq] of Object.entries(FREQ)) {
      const count = Math.random() < freq % 1 ? Math.floor(freq) + 1 : Math.floor(freq);
      for (let i = 0; i < count; i++) {
        const [lo, hi] = RANGES[cat];
        const amount = -Math.round(rand(lo, hi));
        const day = Math.floor(rand(1, daysInMonth));
        txs.push(
          buildTransaction({
            date: new Date(year, month, day).toISOString(),
            amount,
            description: pick(MERCHANTS[cat]),
            account: pick(['עו"ש', 'ויזה כאל', 'מאסטרקארד מקס']),
            category: cat,
          })
        );
      }
    }
  }

  txs.sort((a, b) => new Date(b.date) - new Date(a.date));
  return txs;
}

const data = generate();
writeTransactions(data);
console.log(`✓ נוצרו ${data.length} תנועות דמו (6 חודשים) בקובץ server/data/transactions.json`);
