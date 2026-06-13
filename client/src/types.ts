export interface Transaction {
  id: string;
  hash: string;
  date: string;
  amount: number;
  description: string;
  account: string;
  category: string;
  categoryManual: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: 'income' | 'expense';
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  count: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  avg: number;
  percent: number;
}

export interface CategoryAverage {
  id: string;
  name: string;
  color: string;
  icon: string;
  monthlyAvg: number;
}

export interface TrendPoint {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface DashboardData {
  month: string;
  months: string[];
  summary: Summary;
  categories: CategoryStat[];
  monthlyAverages: CategoryAverage[];
  trend: TrendPoint[];
}
