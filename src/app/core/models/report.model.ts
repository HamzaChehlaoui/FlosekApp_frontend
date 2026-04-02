/**
 * Report models for Flosek frontend
 */

export type ReportType = 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'CUSTOM' | 'CATEGORY' | 'COMPARISON';

export interface ReportRequest {
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  quarter?: number;
}

export interface ReportData {

  reportType: ReportType;
  startDate: string;
  endDate: string;
  periodLabel: string;

  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;

  incomeChange: number;
  expenseChange: number;
  savingsChange: number;

  monthlyData: MonthlyReportData[];

  categoryBreakdown: CategoryReportData[];

  topExpenses: TopExpenseData[];
}

export interface MonthlyReportData {
  month: string;
  year: number;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryReportData {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface TopExpenseData {
  id: string;
  description: string;
  category: string;
  color: string;
  amount: number;
  date: string;
}

/**
 * Financial metrics for dashboard display
 */
export interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}
