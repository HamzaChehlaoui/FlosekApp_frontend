import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../../../core/components/header/header.component';
import { BudgetService } from '../../../../core/services';
import { Budget } from '../../../../core/models';

interface BudgetDisplay {
  id: string;
  name: string;
  emoji: string;
  color: string;
  allocated: number;
  spent: number;
  percentage: number;
}

@Component({
  selector: 'app-budget-planner',
  standalone: true,
  imports: [CommonModule, HeaderComponent, TranslateModule],
  templateUrl: './budget-planner.component.html',
  styleUrl: './budget-planner.component.scss'
})
export class BudgetPlannerComponent implements OnInit {
  currentMonth = '';
  isLoading = true;
  errorMessage = '';

  // Budget Summary
  totalBudget = 0;
  totalSpent = 0;
  totalRemaining = 0;
  budgetPercentage = 0;

  // Budget Categories
  budgetCategories: BudgetDisplay[] = [];

  // Budget Tips
  budgetTips = [
    { icon: '💡', title: 'Track Daily', description: 'Review your spending every day to stay on track' },
    { icon: '🎯', title: 'Set Realistic Goals', description: 'Make sure your budget limits are achievable' },
    { icon: '📊', title: 'Analyze Trends', description: 'Look at your spending patterns monthly' },
    { icon: '⚠️', title: 'Emergency Fund', description: 'Always allocate 10-20% for unexpected expenses' }
  ];

  constructor(private readonly budgetService: BudgetService) {}

  ngOnInit(): void {
    this.currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    this.loadBudgetData();
  }

  loadBudgetData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.budgetService.getActiveBudgets().subscribe({
      next: (budgets) => {
        this.budgetCategories = budgets.map(budget => this.mapBudgetToDisplay(budget));
        this.recalculateBudget();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading budgets:', error);
        this.errorMessage = 'Failed to load budgets. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapBudgetToDisplay(budget: Budget): BudgetDisplay {
    const percentage = budget.amount > 0
      ? Math.round((budget.spentAmount / budget.amount) * 100)
      : 0;
    return {
      id: budget.id,
      name: budget.name || budget.category?.name || 'Budget',
      emoji: budget.category?.icon || '📊',
      color: budget.category?.color || '#6b7280',
      allocated: budget.amount,
      spent: budget.spentAmount,
      percentage
    };
  }

  getBudgetStatus(percentage: number): 'safe' | 'warning' | 'danger' {
    if (percentage <= 70) return 'safe';
    if (percentage <= 90) return 'warning';
    return 'danger';
  }

  getOverallBudgetStatus(): 'safe' | 'warning' | 'danger' {
    return this.getBudgetStatus(this.budgetPercentage);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  openAddBudget(): void {
    // Navigate to add budget page or open modal
    console.log('Open add budget');
  }

  editCategory(budgetId: string): void {
    // Navigate to edit budget page or open modal
    console.log('Edit budget:', budgetId);
  }

  deleteCategory(budgetId: string): void {
    if (confirm('Are you sure you want to delete this budget category?')) {
      this.budgetService.deleteBudget(budgetId).subscribe({
        next: () => {
          this.budgetCategories = this.budgetCategories.filter(cat => cat.id !== budgetId);
          this.recalculateBudget();
        },
        error: (error) => {
          console.error('Error deleting budget:', error);
          alert('Failed to delete budget. Please try again.');
        }
      });
    }
  }

  recalculateBudget(): void {
    this.totalBudget = this.budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
    this.totalSpent = this.budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
    this.totalRemaining = this.totalBudget - this.totalSpent;
    this.budgetPercentage = Math.round((this.totalSpent / this.totalBudget) * 100);
  }
}
