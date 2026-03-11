import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  isRecurring?: boolean;
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

  // Delete Modal
  showDeleteModal = false;
  budgetToDelete: BudgetDisplay | null = null;
  isDeleting = false;

  // Budget Tips
  budgetTips = [
    { icon: '💡', titleKey: 'budget.tips.trackDaily.title', descriptionKey: 'budget.tips.trackDaily.description' },
    { icon: '🎯', titleKey: 'budget.tips.realisticGoals.title', descriptionKey: 'budget.tips.realisticGoals.description' },
    { icon: '📊', titleKey: 'budget.tips.analyzeTrends.title', descriptionKey: 'budget.tips.analyzeTrends.description' },
    { icon: '⚠️', titleKey: 'budget.tips.emergencyFund.title', descriptionKey: 'budget.tips.emergencyFund.description' }
  ];

  constructor(
    private readonly budgetService: BudgetService,
    private readonly categoryService: CategoryService,
    private readonly fb: FormBuilder,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.setCurrentMonth();
    this.translate.onLangChange.subscribe(() => this.setCurrentMonth());
    this.initForm();
    this.loadCategories();
    this.loadBudgetData();
  }

  private setCurrentMonth(): void {
    this.currentMonth = new Date().toLocaleDateString(this.getCurrentLocale(), {
      month: 'long',
      year: 'numeric'
    });
  }

  private getCurrentLocale(): string {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
    if (lang.startsWith('ar')) return 'ar-MA';
    if (lang.startsWith('fr')) return 'fr-FR';
    return 'en-US';
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
      endDate: [endOfMonth, Validators.required],
      isRecurring: [false]
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
        this.errorMessage = this.translate.instant('budget.errors.loadFailed');
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
      name: budget.name || budget.category?.name || this.translate.instant('budget.fallbackName'),
      icon: budget.category?.icon || 'account_balance_wallet',
      color: budget.category?.color || '#6b7280',
      allocated: budget.amount,
      spent: budget.spentAmount,
      percentage,
      categoryId: budget.category?.id,
      isRecurring: budget.isRecurring
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
    return new Date(date).toLocaleDateString(this.getCurrentLocale(), {
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
      endDate: endOfMonth,
      isRecurring: false
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
        endDate: endOfMonth,
        isRecurring: budget.isRecurring || false
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
      name: this.budgetForm.value.name || undefined,
      isRecurring: this.budgetForm.value.isRecurring || false
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
        this.modalSuccess = this.translate.instant('budget.messages.created');
        this.isSubmitting = false;
        setTimeout(() => {
          this.closeModal();
          this.loadBudgetData();
        }, 1000);
      },
      error: (error) => {
        console.error('Error creating budget:', error);
        this.modalError = error.error?.message || this.translate.instant('budget.errors.createFailed');
        this.isSubmitting = false;
      }
    });
  }

  private updateBudget(data: BudgetRequest): void {
    this.budgetService.updateBudget(this.editingBudgetId!, data).subscribe({
      next: () => {
        this.modalSuccess = this.translate.instant('budget.messages.updated');
        this.isSubmitting = false;
        setTimeout(() => {
          this.closeModal();
          this.loadBudgetData();
        }, 1000);
      },
      error: (error) => {
        console.error('Error updating budget:', error);
        this.modalError = error.error?.message || this.translate.instant('budget.errors.updateFailed');
        this.isSubmitting = false;
      }
    });
  }

  openDeleteModal(budgetId: string): void {
    this.budgetToDelete = this.budgetCategories.find(cat => cat.id === budgetId) || null;
    this.showDeleteModal = !!this.budgetToDelete;
    this.isDeleting = false;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.budgetToDelete = null;
    this.isDeleting = false;
  }

  confirmDeleteBudget(): void {
    if (!this.budgetToDelete || this.isDeleting) return;

    this.isDeleting = true;
    const budgetId = this.budgetToDelete.id;

    this.budgetService.deleteBudget(budgetId).subscribe({
      next: () => {
        this.budgetCategories = this.budgetCategories.filter(cat => cat.id !== budgetId);
        this.recalculateBudget();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting budget:', error);
        this.isDeleting = false;
      }
    });
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
  get isRecurringControl() { return this.budgetForm.get('isRecurring'); }

  onRecurringToggle(): void {
    const isRecurring = !!this.isRecurringControl?.value;
    if (isRecurring) {
      this.startDateControl?.clearValidators();
      this.endDateControl?.clearValidators();
    } else {
      this.startDateControl?.setValidators([Validators.required]);
      this.endDateControl?.setValidators([Validators.required]);
    }
    this.startDateControl?.updateValueAndValidity();
    this.endDateControl?.updateValueAndValidity();
  }

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
    if (this.isCategoryUsed(category.id)) return;
    this.budgetForm.patchValue({ categoryId: category.id });
    this.showCategoryDropdown = false;
  }

  isCategoryUsed(categoryId: string): boolean {
    if (this.isEditMode) {
      const editingBudget = this.budgetCategories.find(b => b.id === this.editingBudgetId);
      if (editingBudget?.categoryId === categoryId) return false;
    }
    return this.budgetCategories.some(b => b.categoryId === categoryId);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.showCategoryDropdown = false;
    }
  }
}
