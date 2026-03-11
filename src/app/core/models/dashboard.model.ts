/**
 * Dashboard models for Flosek frontend
 */

export interface DashboardData {
  totalBalance: number;
  balanceChange: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  remaining: number;
  expenseCategories: number;
  budgetTotal: number;
  budgetSpent: number;
  budgetPercentage: number;
  savingsGoals: SavingsGoal[];
  recentTransactions: Transaction[];
  spendingCategories: SpendingCategory[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  description?: string;
  icon: string;
  color: string;
  progressPercentage: number;
  isCompleted: boolean;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  description: string;
  category: string;
  icon: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export interface SpendingCategory {
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}

/**
 * Display interfaces for UI components
 */
export interface SavingsGoalDisplay {
  id: string;
  name: string;
  icon: string;
  color: string;
  current: number;
  target: number;
  percentage: number;
}

export interface TransactionDisplay {
  id: string;
  description: string;
  category: string;
  icon: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  category?: Category;
  isExceeded: boolean;
  spentPercentage: number;
  isRecurring: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  expenseDate: string;
  category: Category;
  notes?: string;
  isRecurring: boolean;
  createdAt?: string;
}

export interface Salary {
  id: string;
  amount: number;
  currency: string;
  effectiveDate: string;
  description?: string;
  isCurrent: boolean;
  createdAt?: string;
}
