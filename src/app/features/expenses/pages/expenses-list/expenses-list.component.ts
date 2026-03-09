import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../../../core/components/header/header.component';
import { ExpenseService, CategoryService } from '../../../../core/services';
import { Expense, Category } from '../../../../core/models';

interface ExpenseDisplay {
  id: string;
  description: string;
  amount: number;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  date: Date;
  notes?: string;
}

interface CategorySummary {
  name: string;
  icon: string;
  color: string;
  count: number;
  total: number;
}

@Component({
  selector: 'app-expenses-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeaderComponent, TranslateModule],
  templateUrl: './expenses-list.component.html',
  styleUrl: './expenses-list.component.scss'
})
export class ExpensesListComponent implements OnInit {
  expenses: ExpenseDisplay[] = [];
  filteredExpenses: ExpenseDisplay[] = [];
  categories: CategorySummary[] = [];
  allCategories: Category[] = [];

  // Loading & Error states
  isLoading = true;
  errorMessage = '';

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

  constructor(
    private readonly expenseService: ExpenseService,
    private readonly categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.selectedMonth = this.getCurrentMonth();
    this.loadCategories();
    this.loadExpenses();
  }

  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.expenseService.getAllExpenses().subscribe({
      next: (expenses) => {
        this.expenses = expenses.map(exp => this.mapExpenseToDisplay(exp));
        this.applyFilters();
        this.calculateSummary();
        this.updateCategorySummary();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.errorMessage = 'Failed to load expenses. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapExpenseToDisplay(expense: Expense): ExpenseDisplay {
    return {
      id: expense.id,
      description: expense.description || expense.category?.name || 'Expense',
      amount: expense.amount,
      category: expense.category?.name || 'Other',
      categoryIcon: expense.category?.icon || 'category',
      categoryColor: expense.category?.color || '#6b7280',
      date: new Date(expense.expenseDate),
      notes: expense.notes
    };
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
        this.categories = categories.map(cat => ({
          name: cat.name,
          icon: cat.icon || 'category',
          color: cat.color || '#6b7280',
          count: 0,
          total: 0
        }));
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  updateCategorySummary(): void {
    // Reset counts
    this.categories.forEach(cat => {
      cat.count = 0;
      cat.total = 0;
    });

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

  deleteExpense(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          this.expenses = this.expenses.filter(exp => exp.id !== id);
          this.applyFilters();
          this.calculateSummary();
          this.updateCategorySummary();
        },
        error: (error) => {
          console.error('Error deleting expense:', error);
          alert('Failed to delete expense. Please try again.');
        }
      });
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
