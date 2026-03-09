import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../../../core/components/header/header.component';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

interface CategorySpending {
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink, TranslateModule],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.scss'
})
export class ReportsDashboardComponent implements OnInit {
  currentPeriod = '';

  // Financial Metrics
  totalIncome = 0;
  totalExpenses = 0;
  netSavings = 0;
  savingsRate = 0;

  // Monthly Comparison
  monthlyData: MonthlyData[] = [];

  // Category Breakdown
  categorySpending: CategorySpending[] = [];

  // Key Metrics
  keyMetrics: FinancialMetric[] = [];

  // Top Expenses
  topExpenses: { description: string; amount: number; category: string; color: string; date: Date }[] = [];

  ngOnInit(): void {
    const now = new Date();
    this.currentPeriod = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    this.loadReportsData();
    this.calculateMetrics();
  }

  loadReportsData(): void {
    // Mock data - Replace with actual API calls

    // Monthly Data (last 6 months)
    this.monthlyData = [
      { month: 'Aug', income: 8000, expenses: 5500, savings: 2500 },
      { month: 'Sep', income: 8200, expenses: 5800, savings: 2400 },
      { month: 'Oct', income: 8500, expenses: 5200, savings: 3300 },
      { month: 'Nov', income: 8300, expenses: 6100, savings: 2200 },
      { month: 'Dec', income: 9000, expenses: 6500, savings: 2500 },
      { month: 'Jan', income: 8500, expenses: 5230, savings: 3270 }
    ];

    // Category Spending
    this.categorySpending = [
      { name: 'Housing', icon: 'home', color: '#10b981', amount: 2000, percentage: 38, trend: 'stable', change: 0 },
      { name: 'Food', icon: 'restaurant', color: '#f59e0b', amount: 1200, percentage: 23, trend: 'up', change: 8 },
      { name: 'Transport', icon: 'directions_car', color: '#3b82f6', amount: 800, percentage: 15, trend: 'down', change: -5 },
      { name: 'Bills', icon: 'receipt_long', color: '#8b5cf6', amount: 650, percentage: 12, trend: 'stable', change: 2 },
      { name: 'Entertainment', icon: 'movie', color: '#ec4899', amount: 400, percentage: 8, trend: 'up', change: 12 },
      { name: 'Other', icon: 'category', color: '#6b7280', amount: 180, percentage: 4, trend: 'down', change: -3 }
    ];

    // Top Expenses
    this.topExpenses = [
      { description: 'Rent Payment', amount: 2000, category: 'Housing', color: '#10b981', date: new Date('2026-02-01') },
      { description: 'Grocery Shopping', amount: 450, category: 'Food', color: '#f59e0b', date: new Date('2026-02-04') },
      { description: 'Electricity Bill', amount: 320, category: 'Bills', color: '#8b5cf6', date: new Date('2026-02-03') },
      { description: 'Gas Station', amount: 250, category: 'Transport', color: '#3b82f6', date: new Date('2026-02-02') },
      { description: 'Gym Membership', amount: 200, category: 'Health', color: '#06b6d4', date: new Date('2026-01-28') }
    ];

    // Calculate current month totals
    const currentMonth = this.monthlyData[this.monthlyData.length - 1];
    this.totalIncome = currentMonth.income;
    this.totalExpenses = currentMonth.expenses;
    this.netSavings = currentMonth.savings;
    this.savingsRate = Math.round((this.netSavings / this.totalIncome) * 100);
  }

  calculateMetrics(): void {
    // Calculate changes from previous month
    const currentMonth = this.monthlyData[this.monthlyData.length - 1];
    const previousMonth = this.monthlyData[this.monthlyData.length - 2];

    const incomeChange = ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100;
    const expenseChange = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100;
    const savingsChange = ((currentMonth.savings - previousMonth.savings) / previousMonth.savings) * 100;

    this.keyMetrics = [
      {
        label: 'Total Income',
        value: this.totalIncome,
        change: Math.abs(incomeChange),
        trend: incomeChange >= 0 ? 'up' : 'down',
        icon: 'income',
        color: '#10b981'
      },
      {
        label: 'Total Expenses',
        value: this.totalExpenses,
        change: Math.abs(expenseChange),
        trend: expenseChange >= 0 ? 'up' : 'down',
        icon: 'expense',
        color: '#ef4444'
      },
      {
        label: 'Net Savings',
        value: this.netSavings,
        change: Math.abs(savingsChange),
        trend: savingsChange >= 0 ? 'up' : 'down',
        icon: 'savings',
        color: '#3b82f6'
      },
      {
        label: 'Savings Rate',
        value: this.savingsRate,
        change: 5,
        trend: 'up',
        icon: 'rate',
        color: '#8b5cf6'
      }
    ];
  }

  getMaxValue(): number {
    return Math.max(
      ...this.monthlyData.map(m => Math.max(m.income, m.expenses, m.savings))
    );
  }

  getBarHeight(value: number): number {
    const max = this.getMaxValue();
    return (value / max) * 100;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  exportReport(): void {
    // TODO: Implement export functionality
    console.log('Export report');
  }

  changeTimePeriod(period: string): void {
    // TODO: Implement time period filtering
    console.log('Change period to:', period);
  }
}
