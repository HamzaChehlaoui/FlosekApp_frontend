import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../../core/components/header/header.component';

interface BudgetCategory {
  id: number;
  name: string;
  emoji: string;
  color: string;
  allocated: number;
  spent: number;
  percentage: number;
}

interface BudgetActivity {
  id: number;
  description: string;
  category: string;
  categoryColor: string;
  amount: number;
  date: Date;
  type: 'expense' | 'adjustment';
}

@Component({
  selector: 'app-budget-planner',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink],
  templateUrl: './budget-planner.component.html',
  styleUrl: './budget-planner.component.scss'
})
export class BudgetPlannerComponent implements OnInit {
  currentMonth = '';

  // Budget Summary
  totalBudget = 0;
  totalSpent = 0;
  totalRemaining = 0;
  budgetPercentage = 0;

  // Budget Categories
  budgetCategories: BudgetCategory[] = [];

  // Recent Activities
  recentActivities: BudgetActivity[] = [];

  // Budget Tips
  budgetTips = [
    { icon: '💡', title: 'Track Daily', description: 'Review your spending every day to stay on track' },
    { icon: '🎯', title: 'Set Realistic Goals', description: 'Make sure your budget limits are achievable' },
    { icon: '📊', title: 'Analyze Trends', description: 'Look at your spending patterns monthly' },
    { icon: '⚠️', title: 'Emergency Fund', description: 'Always allocate 10-20% for unexpected expenses' }
  ];

  ngOnInit(): void {
    this.currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    this.loadBudgetData();
  }

  loadBudgetData(): void {
    // Mock data - Replace with actual API calls
    this.totalBudget = 6000;
    this.totalSpent = 5230.75;
    this.totalRemaining = this.totalBudget - this.totalSpent;
    this.budgetPercentage = Math.round((this.totalSpent / this.totalBudget) * 100);

    // Budget Categories
    this.budgetCategories = [
      { id: 1, name: 'Housing', emoji: '🏠', color: '#10b981', allocated: 2000, spent: 2000, percentage: 100 },
      { id: 2, name: 'Food', emoji: '🍔', color: '#f59e0b', allocated: 1200, spent: 1050.50, percentage: 88 },
      { id: 3, name: 'Transport', emoji: '🚗', color: '#3b82f6', allocated: 800, spent: 650, percentage: 81 },
      { id: 4, name: 'Bills', emoji: '📄', color: '#8b5cf6', allocated: 650, spent: 620, percentage: 95 },
      { id: 5, name: 'Entertainment', emoji: '🎬', color: '#ec4899', allocated: 400, spent: 380, percentage: 95 },
      { id: 6, name: 'Health', emoji: '💪', color: '#06b6d4', allocated: 500, spent: 350.25, percentage: 70 },
      { id: 7, name: 'Shopping', emoji: '🛍️', color: '#f43f5e', allocated: 300, spent: 180, percentage: 60 },
      { id: 8, name: 'Savings', emoji: '💰', color: '#14b8a6', allocated: 150, spent: 0, percentage: 0 }
    ];

    // Recent Activities
    this.recentActivities = [
      { id: 1, description: 'Grocery Shopping', category: 'Food', categoryColor: '#f59e0b', amount: 450.50, date: new Date('2026-02-12'), type: 'expense' },
      { id: 2, description: 'Electricity Bill', category: 'Bills', categoryColor: '#8b5cf6', amount: 320, date: new Date('2026-02-11'), type: 'expense' },
      { id: 3, description: 'Gas Station', category: 'Transport', categoryColor: '#3b82f6', amount: 250, date: new Date('2026-02-10'), type: 'expense' },
      { id: 4, description: 'Netflix Subscription', category: 'Entertainment', categoryColor: '#ec4899', amount: 55, date: new Date('2026-02-09'), type: 'expense' },
      { id: 5, description: 'Gym Membership', category: 'Health', categoryColor: '#06b6d4', amount: 200, date: new Date('2026-02-08'), type: 'expense' }
    ];
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
    // TODO: Navigate to add budget or open modal
    console.log('Open add budget');
  }

  editCategory(categoryId: number): void {
    // TODO: Navigate to edit category or open modal
    console.log('Edit category:', categoryId);
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this budget category?')) {
      this.budgetCategories = this.budgetCategories.filter(cat => cat.id !== categoryId);
      this.recalculateBudget();
    }
  }

  recalculateBudget(): void {
    this.totalBudget = this.budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
    this.totalSpent = this.budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
    this.totalRemaining = this.totalBudget - this.totalSpent;
    this.budgetPercentage = Math.round((this.totalSpent / this.totalBudget) * 100);
  }
}
