import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../../../core/components/header/header.component';
import { BudgetService, CategoryService } from '../../../../core/services';
import { BudgetRequest } from '../../../../core/services/budget.service';
import { Budget, Category } from '../../../../core/models';

interface BudgetDisplay {
  id: string;
  name: string;
  icon: string;
  color: string;
  allocated: number;
  spent: number;
  percentage: number;
  categoryId?: string;
}

@Component({
  selector: 'app-budget-planner',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ReactiveFormsModule, TranslateModule],
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

  // Modal Properties
  showModal = false;
  isEditMode = false;
  editingBudgetId: string | null = null;
  budgetForm!: FormGroup;
  categories: Category[] = [];
  isSubmitting = false;
  modalError = '';
  modalSuccess = '';
  showCategoryDropdown = false;

  // Budget Tips
  budgetTips = [
    { icon: '💡', title: 'Track Daily', description: 'Review your spending every day to stay on track' },
    { icon: '🎯', title: 'Set Realistic Goals', description: 'Make sure your budget limits are achievable' },
    { icon: '📊', title: 'Analyze Trends', description: 'Look at your spending patterns monthly' },
    { icon: '⚠️', title: 'Emergency Fund', description: 'Always allocate 10-20% for unexpected expenses' }
  ];

  constructor(
    private readonly budgetService: BudgetService,
    private readonly categoryService: CategoryService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    this.initForm();
    this.loadCategories();
    this.loadBudgetData();
  }

  private initForm(): void {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    this.budgetForm = this.fb.group({
      name: ['', [Validators.maxLength(100)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      categoryId: ['', Validators.required],
      startDate: [startOfMonth, Validators.required],
      endDate: [endOfMonth, Validators.required]
    });
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
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
      icon: budget.category?.icon || 'account_balance_wallet',
      color: budget.category?.color || '#6b7280',
      allocated: budget.amount,
      spent: budget.spentAmount,
      percentage,
      categoryId: budget.category?.id
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
    this.isEditMode = false;
    this.editingBudgetId = null;
    this.modalError = '';
    this.modalSuccess = '';

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    this.budgetForm.reset({
      name: '',
      amount: '',
      categoryId: '',
      startDate: startOfMonth,
      endDate: endOfMonth
    });
    this.showModal = true;
  }

  editCategory(budgetId: string): void {
    this.isEditMode = true;
    this.editingBudgetId = budgetId;
    this.modalError = '';
    this.modalSuccess = '';

    const budget = this.budgetCategories.find(b => b.id === budgetId);
    if (budget) {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

      this.budgetForm.patchValue({
        name: budget.name,
        amount: budget.allocated,
        categoryId: budget.categoryId || '',
        startDate: startOfMonth,
        endDate: endOfMonth
      });
      this.showModal = true;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.editingBudgetId = null;
    this.modalError = '';
    this.modalSuccess = '';
  }

  onSubmitBudget(): void {
    if (this.budgetForm.invalid) {
      Object.keys(this.budgetForm.controls).forEach(key => {
        this.budgetForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.modalError = '';
    this.modalSuccess = '';

    const budgetData: BudgetRequest = {
      amount: Number(this.budgetForm.value.amount),
      categoryId: this.budgetForm.value.categoryId,
      startDate: this.budgetForm.value.startDate,
      endDate: this.budgetForm.value.endDate,
      name: this.budgetForm.value.name || undefined
    };

    if (this.isEditMode && this.editingBudgetId) {
      this.updateBudget(budgetData);
    } else {
      this.createBudget(budgetData);
    }
  }

  private createBudget(data: BudgetRequest): void {
    this.budgetService.createBudget(data).subscribe({
      next: () => {
        this.modalSuccess = 'Budget created successfully!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.closeModal();
          this.loadBudgetData();
        }, 1000);
      },
      error: (error) => {
        console.error('Error creating budget:', error);
        this.modalError = error.error?.message || 'Failed to create budget';
        this.isSubmitting = false;
      }
    });
  }

  private updateBudget(data: BudgetRequest): void {
    this.budgetService.updateBudget(this.editingBudgetId!, data).subscribe({
      next: () => {
        this.modalSuccess = 'Budget updated successfully!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.closeModal();
          this.loadBudgetData();
        }, 1000);
      },
      error: (error) => {
        console.error('Error updating budget:', error);
        this.modalError = error.error?.message || 'Failed to update budget';
        this.isSubmitting = false;
      }
    });
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
    this.budgetPercentage = this.totalBudget > 0 ? Math.round((this.totalSpent / this.totalBudget) * 100) : 0;
  }

  // Form getters
  get nameControl() { return this.budgetForm.get('name'); }
  get amountControl() { return this.budgetForm.get('amount'); }
  get categoryIdControl() { return this.budgetForm.get('categoryId'); }
  get startDateControl() { return this.budgetForm.get('startDate'); }
  get endDateControl() { return this.budgetForm.get('endDate'); }

  getSelectedCategoryIcon(): string {
    const categoryId = this.categoryIdControl?.value;
    if (!categoryId) return 'category';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.icon || 'category';
  }

  getSelectedCategoryName(): string {
    const categoryId = this.categoryIdControl?.value;
    if (!categoryId) return '';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || '';
  }

  selectCategory(category: Category): void {
    this.budgetForm.patchValue({ categoryId: category.id });
    this.showCategoryDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.showCategoryDropdown = false;
    }
  }
}
