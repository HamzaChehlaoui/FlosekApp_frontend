import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, DashboardService } from '../../../../core/services';
import { User, DashboardData, SpendingCategory, SavingsGoalDisplay, TransactionDisplay } from '../../../../core/models';
import { HeaderComponent } from '../../../../core/components/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  currentMonth = '';
  isLoading = true;
  errorMessage = '';

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
  savingsGoals: SavingsGoalDisplay[] = [];

  // Recent Transactions
  recentTransactions: TransactionDisplay[] = [];

  // Spending Categories
  spendingCategories: SpendingCategory[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly dashboardService: DashboardService,
    private readonly router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboard().subscribe({
      next: (data: DashboardData) => {
        this.mapDashboardData(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.errorMessage = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapDashboardData(data: DashboardData): void {
    // Financial Summary
    this.balance = data.totalBalance || 0;
    this.balanceChange = data.balanceChange || 0;
    this.monthlyIncome = data.monthlyIncome || 0;
    this.monthlyExpenses = data.monthlyExpenses || 0;
    this.remaining = data.remaining || 0;
    this.expenseCategories = data.expenseCategories || 0;

    // Budget
    this.budgetTotal = data.budgetTotal || 0;
    this.budgetSpent = data.budgetSpent || 0;
    this.budgetPercentage = data.budgetPercentage || 0;

    // Map Savings Goals
    this.savingsGoals = (data.savingsGoals || []).map(goal => ({
      id: goal.id,
      name: goal.name,
      icon: goal.icon || 'savings',
      color: goal.color || '#10b981',
      current: goal.currentAmount || 0,
      target: goal.targetAmount || 0,
      percentage: goal.progressPercentage || 0
    }));

    // Map Recent Transactions
    this.recentTransactions = (data.recentTransactions || []).map(tx => ({
      id: tx.id,
      description: tx.description,
      category: tx.category,
      icon: tx.icon || 'payments',
      amount: tx.amount,
      type: tx.type,
      date: new Date(tx.date)
    }));

    // Spending Categories
    this.spendingCategories = (data.spendingCategories || []).map((cat: any) => ({
      name: cat.name,
      icon: cat.icon || cat.emoji || 'category',
      color: cat.color || '#6b7280',
      amount: cat.amount,
      percentage: cat.percentage
    }));
  }

  openAddExpense(): void {
    this.router.navigate(['/expenses/add']);
  }

  openAddIncome(): void {
    this.router.navigate(['/salary']);
  }
}

