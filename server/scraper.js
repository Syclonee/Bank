// אינטגרציה אופציונלית עם israeli-bank-scrapers לגישת קריאה-בלבד לבנקים וכרטיסי אשראי.
//
// חשוב: הספרייה כבדה (מורידה דפדפן Chromium בהתקנה), לכן היא לא מותקנת כברירת מחדל.
// כדי להפעיל גישה אמיתית לחשבון:  npm --prefix server install israeli-bank-scrapers
//
// פרטי ההתחברות נשארים מקומיים ולא נשמרים לדיסק. השימוש הוא קריאה בלבד.
import { buildTransaction } from './importer.js';

let scrapersModule = null;

async function loadScrapers() {
  if (scrapersModule) return scrapersModule;
  try {
    scrapersModule = await import('israeli-bank-scrapers');
    return scrapersModule;
  } catch {
    return null;
  }
}

export async function isScraperAvailable() {
  return (await loadScrapers()) !== null;
}

// companyId לדוגמה: 'hapoalim','leumi','discount','mizrahi','visaCal','max','isracard','amex','beinleumi','yahav','onezero'
export async function scrapeAccount({ companyId, credentials, startDate }) {
  const mod = await loadScrapers();
  if (!mod) {
    throw new Error(
      'israeli-bank-scrapers לא מותקן. הרץ: npm --prefix server install israeli-bank-scrapers'
    );
  }

  const { createScraper } = mod;
  const options = {
    companyId,
    startDate: startDate ? new Date(startDate) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
    combineInstallments: false,
    showBrowser: false,
  };

  const scraper = createScraper(options);
  const result = await scraper.scrape(credentials);

  if (!result.success) {
    throw new Error(result.errorMessage || result.errorType || 'הגירוד נכשל');
  }

  const txs = [];
  for (const acc of result.accounts || []) {
    for (const t of acc.txns || []) {
      // chargedAmount שלילי = הוצאה, חיובי = הכנסה
      txs.push(
        buildTransaction({
          date: t.date,
          amount: t.chargedAmount ?? t.originalAmount,
          description: t.description || t.memo || '',
          account: `${companyId}-${acc.accountNumber || ''}`,
        })
      );
    }
  }
  return txs;
}
