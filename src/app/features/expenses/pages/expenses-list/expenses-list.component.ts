import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../core/components/header/header.component';

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  categoryEmoji: string;
  categoryColor: string;
  date: Date;
  paymentMethod: string;
  notes?: string;
}

interface Category {
  name: string;
  emoji: string;
  color: string;
  count: number;
  total: number;
}

@Component({
  selector: 'app-expenses-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeaderComponent],
  templateUrl: './expenses-list.component.html',
  styleUrl: './expenses-list.component.scss'
})
export class ExpensesListComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  categories: Category[] = [];

  // Filters
  searchQuery = '';
  selectedCategory = 'all';
  selectedMonth = '';
  sortBy = 'date-desc';

  // Summary
  totalExpenses = 0;
  monthlyAverage = 0;
  highestCategory = '';

  // View mode
  viewMode: 'list' | 'grid' = 'list';

  ngOnInit(): void {
    this.loadExpenses();
    this.loadCategories();
    this.calculateSummary();
    this.selectedMonth = this.getCurrentMonth();
  }

  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  loadExpenses(): void {
    // Mock data - Replace with API call
    this.expenses = [
      { id: 1, description: 'Grocery Shopping', amount: 450.5, category: 'Food', categoryEmoji: '🛒', categoryColor: '#f59e0b', date: new Date('2026-02-04'), paymentMethod: 'Card', notes: 'Weekly groceries' },
      { id: 2, description: 'Electricity Bill', amount: 320, category: 'Bills', categoryEmoji: '⚡', categoryColor: '#8b5cf6', date: new Date('2026-02-03'), paymentMethod: 'Bank Transfer' },
      { id: 3, description: 'Restaurant Dinner', amount: 180, category: 'Food', categoryEmoji: '🍽️', categoryColor: '#f59e0b', date: new Date('2026-02-03'), paymentMethod: 'Card' },
      { id: 4, description: 'Gas Station', amount: 250, category: 'Transport', categoryEmoji: '⛽', categoryColor: '#3b82f6', date: new Date('2026-02-02'), paymentMethod: 'Card' },
      { id: 5, description: 'Netflix Subscription', amount: 55, category: 'Entertainment', categoryEmoji: '🎬', categoryColor: '#ec4899', date: new Date('2026-02-01'), paymentMethod: 'Card' },
      { id: 6, description: 'Rent Payment', amount: 2000, category: 'Housing', categoryEmoji: '🏠', categoryColor: '#10b981', date: new Date('2026-02-01'), paymentMethod: 'Bank Transfer' },
      { id: 7, description: 'Phone Bill', amount: 150, category: 'Bills', categoryEmoji: '📱', categoryColor: '#8b5cf6', date: new Date('2026-01-30'), paymentMethod: 'Card' },
      { id: 8, description: 'Gym Membership', amount: 200, category: 'Health', categoryEmoji: '💪', categoryColor: '#06b6d4', date: new Date('2026-01-28'), paymentMethod: 'Card' },
      { id: 9, description: 'Coffee Shop', amount: 45, category: 'Food', categoryEmoji: '☕', categoryColor: '#f59e0b', date: new Date('2026-01-27'), paymentMethod: 'Cash' },
      { id: 10, description: 'Uber Ride', amount: 85, category: 'Transport', categoryEmoji: '🚗', categoryColor: '#3b82f6', date: new Date('2026-01-26'), paymentMethod: 'Card' },
    ];
    this.applyFilters();
  }

  loadCategories(): void {
    this.categories = [
      { name: 'Food', emoji: '🍔', color: '#f59e0b', count: 0, total: 0 },
      { name: 'Transport', emoji: '🚗', color: '#3b82f6', count: 0, total: 0 },
      { name: 'Housing', emoji: '🏠', color: '#10b981', count: 0, total: 0 },
      { name: 'Bills', emoji: '📄', color: '#8b5cf6', count: 0, total: 0 },
      { name: 'Entertainment', emoji: '🎬', color: '#ec4899', count: 0, total: 0 },
      { name: 'Health', emoji: '💪', color: '#06b6d4', count: 0, total: 0 },
      { name: 'Shopping', emoji: '🛍️', color: '#f43f5e', count: 0, total: 0 },
      { name: 'Other', emoji: '📦', color: '#6b7280', count: 0, total: 0 },
    ];

    // Calculate counts and totals
    this.expenses.forEach(exp => {
      const cat = this.categories.find(c => c.name === exp.category);
      if (cat) {
        cat.count++;
        cat.total += exp.amount;
      }
    });
  }

  calculateSummary(): void {
    this.totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    this.monthlyAverage = this.totalExpenses / 2; // Assuming 2 months of data

    const categoryTotals = new Map<string, number>();
    this.expenses.forEach(exp => {
      categoryTotals.set(exp.category, (categoryTotals.get(exp.category) || 0) + exp.amount);
    });

    let maxAmount = 0;
    categoryTotals.forEach((amount, category) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        this.highestCategory = category;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.expenses];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(exp =>
        exp.description.toLowerCase().includes(query) ||
        exp.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      result = result.filter(exp => exp.category === this.selectedCategory);
    }

    // Month filter
    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-').map(Number);
      result = result.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getFullYear() === year && expDate.getMonth() + 1 === month;
      });
    }

    // Sort
    switch (this.sortBy) {
      case 'date-desc':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'amount-desc':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        result.sort((a, b) => a.amount - b.amount);
        break;
    }

    this.filteredExpenses = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onMonthChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }

  deleteExpense(id: number): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenses = this.expenses.filter(exp => exp.id !== id);
      this.applyFilters();
      this.calculateSummary();
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getRelativeDate(date: Date): string {
    const now = new Date();
    const expDate = new Date(date);
    const diffTime = now.getTime() - expDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return this.formatDate(date);
  }
}
