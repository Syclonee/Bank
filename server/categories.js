// מנוע קטגוריזציה: מסווג תנועות לקטגוריות לפי מילות מפתח בשם בית העסק.
// אפשר להוסיף/לשנות חוקים, והמשתמש יכול לדרוס ידנית קטגוריה לכל תנועה.

export const CATEGORIES = [
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

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

// חוקי סיווג: כל מילת מפתח (חלקית, לא רגישה לאותיות) ממופה לקטגוריה.
const RULES = [
  { cat: 'groceries', keywords: ['שופרסל', 'רמי לוי', 'ויקטורי', 'יוחננוף', 'טיב טעם', 'אושר עד', 'מגה', 'יינות ביתן', 'סופר', 'super', 'shufersal', 'מחסני', 'am pm', 'am:pm', 'טיב'] },
  { cat: 'dining', keywords: ['מקדונלד', 'בורגר', 'קפה', 'cafe', 'coffee', 'ארומה', 'cofix', 'רולדין', 'פיצה', 'pizza', 'מסעד', 'wolt', 'וולט', 'tenbis', 'תן ביס', 'משלוח', 'sushi', 'סושי', 'הומבורגר', 'גלידה', 'מאפה', 'בית קפה', 'landwer'] },
  { cat: 'transport', keywords: ['פז', 'דלק', 'paz', 'delek', 'סונול', 'דור אלון', 'ten', 'רכבת', 'אגד', 'דן', 'רב קו', 'rav kav', 'מטרופולין', 'gett', 'גט', 'uber', 'יאנגו', 'yango', 'pango', 'cellopark', 'חניון', 'כביש 6', 'נתיבי', 'מוניות'] },
  { cat: 'housing', keywords: ['חשמל', 'חברת חשמל', 'מים', 'תאגיד', 'ארנונה', 'עיריית', 'גז', 'פזגז', 'סופרגז', 'בזק', 'hot', 'הוט', 'partner', 'פרטנר', 'cellcom', 'סלקום', 'yes', 'משכנת', 'שכר דירה', 'ועד בית', 'גולן טלקום'] },
  { cat: 'shopping', keywords: ['קסטרו', 'castro', 'fox', 'זara', 'zara', 'h&m', 'אייס', 'ace', 'ikea', 'איקאה', 'home center', 'הום סנטר', 'מקס', 'max stock', 'גולף', 'renuar', 'רנואר', 'terminal x', 'asos', 'aliexpress', 'עלי אקספרס', 'amazon', 'אמזון', 'next', 'שופ'] },
  { cat: 'health', keywords: ['סופר פארם', 'super-pharm', 'בית מרקחת', 'מרקחת', 'כללית', 'מכבי', 'מאוחדת', 'לאומית', 'קופת חולים', 'רופא', 'שיניים', 'אופטיק', 'ביטוח בריאות', 'be', 'ניו פארם'] },
  { cat: 'entertainment', keywords: ['netflix', 'נטפליקס', 'spotify', 'ספוטיפיי', 'disney', 'youtube', 'apple.com', 'icloud', 'google', 'cinema', 'סינמה', 'יס פלאנט', 'רב חן', 'הופעה', 'תיאטרון', 'כרטיסים', 'מנוי', 'gym', 'חדר כושר', 'הולמס', 'icount', 'playstation', 'steam', 'xbox', 'הימור', 'הגרלה'] },
  { cat: 'education', keywords: ['אוניברסיט', 'מכללה', 'בית ספר', 'גן ילדים', 'צהרון', 'חוג', 'קורס', 'udemy', 'ספרים', 'סטימצקי', 'צומת ספרים'] },
  { cat: 'travel', keywords: ['booking', 'בוקינג', 'airbnb', 'el al', 'אל על', 'ryanair', 'wizz', 'ויז', 'isracard tourism', 'מלון', 'hotel', 'טיסה', 'נתב"ג', 'expedia', 'agoda', 'הראל נסיעות'] },
  { cat: 'finance', keywords: ['עמלת', 'עמלה', 'ריבית', 'דמי ניהול', 'דמי כרטיס', 'הפרשי', 'fee', 'commission', 'ביטוח', 'הראל', 'מגדל', 'כלל', 'מנורה', 'הפניקס', 'פנסי', 'גמל', 'השתלמות'] },
  { cat: 'transfer', keywords: ['העברה', 'מזומן', 'כספומט', 'משיכת', 'paybox', 'פייבוקס', 'bit', 'ביט', 'העברת', 'transfer', 'הפקדה', "צ'ק", 'שיק', 'הוראת קבע'] },
];

const INCOME_KEYWORDS = ['משכורת', 'שכר', 'מעביד', 'salary', 'זיכוי', 'החזר', 'קצבה', 'ביטוח לאומי', 'מענק', 'דיבידנד', 'ריבית זכות', 'מלגה', 'פיקדון'];

function normalize(str) {
  return (str || '').toString().toLowerCase().trim();
}

// מקבל תיאור וסכום (חיובי=הכנסה) ומחזיר מזהה קטגוריה.
export function categorize(description, amount) {
  const text = normalize(description);

  if (amount > 0) {
    // הכנסה - בודקים אם יש מילת מפתח של הכנסה, אחרת עדיין נחשב הכנסה
    return 'income';
  }

  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(normalize(k)))) {
      return rule.cat;
    }
  }

  // אולי זו הכנסה שהוזנה כסכום שלילי בטעות? בודקים מילות הכנסה
  if (INCOME_KEYWORDS.some((k) => text.includes(normalize(k)))) {
    return 'income';
  }

  return 'other';
}
