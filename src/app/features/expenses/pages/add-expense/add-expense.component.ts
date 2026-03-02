import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ExpenseService, CategoryService } from '../../../../core/services';
import { ExpenseRequest } from '../../../../core/services/expense.service';
import { Category } from '../../../../core/models';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss'
})
export class AddExpenseComponent implements OnInit {
  expenseForm!: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  expenseId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly expenseService: ExpenseService,
    private readonly categoryService: CategoryService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.checkEditMode();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      expenseDate: [today, Validators.required],
      categoryId: ['', Validators.required],
      notes: ['', Validators.maxLength(500)],
      isRecurring: [false]
    });
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'Failed to load categories';
        this.isLoading = false;
      }
    });
  }

  private checkEditMode(): void {
    this.expenseId = this.route.snapshot.paramMap.get('id');
    if (this.expenseId) {
      this.isEditMode = true;
      this.loadExpenseForEdit(this.expenseId);
    }
  }

  private loadExpenseForEdit(id: string): void {
    this.isLoading = true;
    this.expenseService.getExpenseById(id).subscribe({
      next: (expense) => {
        this.expenseForm.patchValue({
          amount: expense.amount,
          description: expense.description,
          expenseDate: expense.expenseDate ? expense.expenseDate.toString().split('T')[0] : '',
          categoryId: expense.category?.id || '',
          notes: expense.notes || '',
          isRecurring: expense.isRecurring || false
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expense:', error);
        this.errorMessage = 'Failed to load expense data';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const expenseData: ExpenseRequest = {
      amount: Number(this.expenseForm.value.amount),
      description: this.expenseForm.value.description,
      expenseDate: this.expenseForm.value.expenseDate,
      categoryId: this.expenseForm.value.categoryId,
      notes: this.expenseForm.value.notes || undefined,
      isRecurring: this.expenseForm.value.isRecurring
    };

    if (this.isEditMode && this.expenseId) {
      this.updateExpense(expenseData);
    } else {
      this.createExpense(expenseData);
    }
  }

  private createExpense(data: ExpenseRequest): void {
    this.expenseService.createExpense(data).subscribe({
      next: () => {
        this.successMessage = 'Expense created successfully!';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/expenses']), 1500);
      },
      error: (error) => {
        console.error('Error creating expense:', error);
        this.errorMessage = error.error?.message || 'Failed to create expense';
        this.isSubmitting = false;
      }
    });
  }

  private updateExpense(data: ExpenseRequest): void {
    this.expenseService.updateExpense(this.expenseId!, data).subscribe({
      next: () => {
        this.successMessage = 'Expense updated successfully!';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/expenses']), 1500);
      },
      error: (error) => {
        console.error('Error updating expense:', error);
        this.errorMessage = error.error?.message || 'Failed to update expense';
        this.isSubmitting = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.expenseForm.controls).forEach(key => {
      this.expenseForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/expenses']);
  }

  // Form field getters for template
  get amount() { return this.expenseForm.get('amount'); }
  get description() { return this.expenseForm.get('description'); }
  get expenseDate() { return this.expenseForm.get('expenseDate'); }
  get categoryId() { return this.expenseForm.get('categoryId'); }
  get notes() { return this.expenseForm.get('notes'); }
}
