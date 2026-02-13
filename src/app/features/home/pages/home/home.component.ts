import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services';
import { User } from '../../../../core/models';
import { HeaderComponent } from '../../../../core/components/header/header.component';

interface SavingsGoal {
  id: number;
  name: string;
  emoji: string;
  color: string;
  current: number;
  target: number;
  percentage: number;
}

interface Transaction {
  id: number;
  description: string;
  category: string;
  emoji: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}

interface SpendingCategory {
  name: string;
  emoji: string;
  color: string;
  amount: number;
  percentage: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  currentMonth = '';

  // Financial Summary
  balance = 0;
  balanceChange = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;
  remaining = 0;
  expenseCategories = 0;

  // Budget
  budgetSpent = 0;
  budgetTotal = 0;
  budgetPercentage = 0;

  // Savings Goals
  savingsGoals: SavingsGoal[] = [];

  // Recent Transactions
  recentTransactions: Transaction[] = [];

  // Spending Categories
  spendingCategories: SpendingCategory[] = [];

  constructor(private authService: AuthService) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Mock data - Replace with actual API calls
    this.balance = 15420.50;
    this.balanceChange = 12.5;
    this.monthlyIncome = 8500.00;
    this.monthlyExpenses = 5230.75;
    this.remaining = this.monthlyIncome - this.monthlyExpenses;
    this.expenseCategories = 6;

    // Budget
    this.budgetTotal = 6000;
    this.budgetSpent = 5230.75;
    this.budgetPercentage = Math.round((this.budgetSpent / this.budgetTotal) * 100);

    // Savings Goals
    this.savingsGoals = [
      { id: 1, name: 'New Car', emoji: '🚗', color: '#10b981', current: 24000, target: 40000, percentage: 60 },
      { id: 2, name: 'Emergency Fund', emoji: '🏦', color: '#3b82f6', current: 8500, target: 10000, percentage: 85 },
      { id: 3, name: 'Vacation', emoji: '✈️', color: '#f59e0b', current: 3200, target: 8000, percentage: 40 }
    ];

    // Recent Transactions
    this.recentTransactions = [
      { id: 1, description: 'Salary', category: 'Income', emoji: '💰', amount: 8500, type: 'income', date: new Date() },
      { id: 2, description: 'Grocery Shopping', category: 'Food', emoji: '🛒', amount: 450.50, type: 'expense', date: new Date() },
      { id: 3, description: 'Electricity Bill', category: 'Bills', emoji: '⚡', amount: 320, type: 'expense', date: new Date() },
      { id: 4, description: 'Freelance Work', category: 'Income', emoji: '💻', amount: 1200, type: 'income', date: new Date() },
      { id: 5, description: 'Restaurant', category: 'Food', emoji: '🍽️', amount: 180, type: 'expense', date: new Date() }
    ];

    // Spending Categories
    this.spendingCategories = [
      { name: 'Housing', emoji: '🏠', color: '#10b981', amount: 2000, percentage: 38 },
      { name: 'Food', emoji: '🍔', color: '#f59e0b', amount: 1200, percentage: 23 },
      { name: 'Transport', emoji: '🚗', color: '#3b82f6', amount: 800, percentage: 15 },
      { name: 'Bills', emoji: '📄', color: '#8b5cf6', amount: 650, percentage: 12 },
      { name: 'Entertainment', emoji: '🎬', color: '#ec4899', amount: 400, percentage: 8 },
      { name: 'Other', emoji: '📦', color: '#6b7280', amount: 180.75, percentage: 4 }
    ];
  }

  openAddExpense(): void {
    // TODO: Navigate to add expense or open modal
    console.log('Open add expense');
  }

  openAddIncome(): void {
    // TODO: Navigate to add income or open modal
    console.log('Open add income');
  }
}
