// מנוע קטגוריזציה (צד-לקוח): מסווג תנועות לקטגוריות לפי מילות מפתח בשם בית העסק.
import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'income', name: 'הכנסות', icon: '💰', color: '#10b981', kind: 'income' },
  { id: 'groceries', name: 'סופרמרקט', icon: '🛒', color: '#f59e0b', kind: 'expense' },
  { id: 'dining', name: 'מסעדות ובתי קפה', icon: '🍽️', color: '#ef4444', kind: 'expense' },
  { id: 'transport', name: 'תחבורה ודלק', icon: '⛽', color: '#3b82f6', kind: 'expense' },
  { id: 'housing', name: 'דיור וחשבונות', icon: '🏠', color: '#8b5cf6', kind: 'expense' },
  { id: 'shopping', name: 'קניות', icon: '🛍️', color: '#ec4899', kind: 'expense' },
  { id: 'health', name: 'בריאות', icon: '💊', color: '#14b8a6', kind: 'expense' },
  { id: 'entertainment', name: 'בילויים ומנויים', icon: '🎬', color: '#f97316', kind: 'expense' },
  { id: 'education', name: 'חינוך', icon: '📚', color: '#6366f1', kind: 'expense' },
  { id: 'travel', name: 'נסיעות וחופשות', icon: '✈️', color: '#06b6d4', kind: 'expense' },
  { id: 'finance', name: 'עמלות וריביות', icon: '🏦', color: '#64748b', kind: 'expense' },
  { id: 'transfer', name: 'העברות ומזומן', icon: '🔄', color: '#94a3b8', kind: 'expense' },
  { id: 'other', name: 'אחר', icon: '📦', color: '#a1a1aa', kind: 'expense' },
];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

export function getCategoryMeta(id: string): Category {
  return CATEGORY_MAP[id] || { ...CATEGORY_MAP.other, id, name: id };
}

// סדר החוקים = סדר העדיפות. קטגוריות ספציפיות לפני כלליות כדי למנוע התאמות שווא.
const RULES: { cat: string; keywords: string[] }[] = [
  { cat: 'health', keywords: ['סופר פארם', 'super-pharm', 'בית מרקחת', 'מרקחת', 'כללית', 'מכבי', 'מאוחדת', 'לאומית', 'קופת חולים', 'רופא', 'שיניים', 'אופטיק', 'ביטוח בריאות', 'ניו פארם', 'be drug'] },
  { cat: 'housing', keywords: ['חשמל', 'חברת חשמל', 'מים', 'תאגיד', 'ארנונה', 'עיריית', 'פזגז', 'סופרגז', 'אמישראגז', 'גז', 'בזק', 'hot', 'הוט', 'partner', 'פרטנר', 'cellcom', 'סלקום', 'yes', 'משכנת', 'שכר דירה', 'ועד בית', 'גולן טלקום'] },
  { cat: 'transport', keywords: ['פז דלק', 'דלק', 'paz', 'delek', 'סונול', 'דור אלון', 'רכבת', 'אגד', 'דן', 'רב קו', 'rav kav', 'מטרופולין', 'gett', 'uber', 'יאנגו', 'yango', 'pango', 'cellopark', 'חניון', 'כביש 6', 'נתיבי', 'מוניות'] },
  { cat: 'dining', keywords: ['מקדונלד', 'בורגר', 'קפה', 'cafe', 'coffee', 'ארומה', 'cofix', 'רולדין', 'פיצה', 'pizza', 'מסעד', 'wolt', 'וולט', 'tenbis', 'תן ביס', 'משלוח', 'sushi', 'סושי', 'הומבורגר', 'גלידה', 'מאפה', 'בית קפה', 'landwer'] },
  { cat: 'groceries', keywords: ['שופרסל', 'רמי לוי', 'ויקטורי', 'יוחננוף', 'טיב טעם', 'אושר עד', 'מגה', 'יינות ביתן', 'סופרמרקט', 'סופרסל', 'shufersal', 'supermarket', 'מחסני השוק', 'am pm', 'am:pm'] },
  { cat: 'shopping', keywords: ['קסטרו', 'castro', 'fox', 'zara', 'h&m', 'אייס', 'ace', 'ikea', 'איקאה', 'home center', 'הום סנטר', 'מקס סטוק', 'max stock', 'גולף', 'renuar', 'רנואר', 'terminal x', 'asos', 'aliexpress', 'עלי אקספרס', 'amazon', 'אמזון', 'שופינג'] },
  { cat: 'entertainment', keywords: ['netflix', 'נטפליקס', 'spotify', 'ספוטיפיי', 'disney', 'youtube', 'apple.com', 'icloud', 'cinema', 'סינמה', 'יס פלאנט', 'רב חן', 'הופעה', 'תיאטרון', 'כרטיסים', 'מנוי', 'gym', 'חדר כושר', 'הולמס', 'playstation', 'steam', 'xbox', 'הימור', 'הגרלה'] },
  { cat: 'education', keywords: ['אוניברסיט', 'מכללה', 'בית ספר', 'גן ילדים', 'צהרון', 'חוג', 'קורס', 'udemy', 'ספרים', 'סטימצקי', 'צומת ספרים'] },
  { cat: 'travel', keywords: ['booking', 'בוקינג', 'airbnb', 'el al', 'אל על', 'ryanair', 'wizz', 'ויז אייר', 'isracard tourism', 'מלון', 'hotel', 'טיסה', 'נתב"ג', 'expedia', 'agoda', 'הראל נסיעות'] },
  { cat: 'finance', keywords: ['עמלת', 'עמלה', 'ריבית', 'דמי ניהול', 'דמי כרטיס', 'הפרשי', 'fee', 'commission', 'ביטוח', 'הראל', 'מגדל ביטוח', 'כלל ביטוח', 'מנורה', 'הפניקס', 'פנסי', 'קופת גמל', 'קרן השתלמות'] },
  { cat: 'transfer', keywords: ['העברה', 'מזומן', 'כספומט', 'משיכת', 'paybox', 'פייבוקס', 'bit', 'ביט', 'העברת', 'transfer', 'הפקדה', "צ'ק", 'שיק', 'הוראת קבע'] },
];

const INCOME_KEYWORDS = ['משכורת', 'שכר', 'מעביד', 'salary', 'זיכוי', 'החזר', 'קצבה', 'ביטוח לאומי', 'מענק', 'דיבידנד', 'ריבית זכות', 'מלגה', 'פיקדון'];

function normalize(str: string): string {
  return (str || '').toString().toLowerCase().trim();
}

// למילים קצרות באנגלית (עד 4 אותיות) דורשים גבולות מילה למניעת התאמות שווא.
function matchKeyword(text: string, keyword: string): boolean {
  const k = normalize(keyword);
  if (!k) return false;
  if (/^[a-z]{1,4}$/.test(k)) {
    return new RegExp(`\\b${k}\\b`).test(text);
  }
  return text.includes(k);
}

export function categorize(description: string, amount: number): string {
  const text = normalize(description);
  if (amount > 0) return 'income';
  for (const rule of RULES) {
    if (rule.keywords.some((k) => matchKeyword(text, k))) return rule.cat;
  }
  if (INCOME_KEYWORDS.some((k) => matchKeyword(text, k))) return 'income';
  return 'other';
}
