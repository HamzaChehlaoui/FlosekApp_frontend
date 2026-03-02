import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SalaryService } from '../../../../core/services';
import { SalaryRequest } from '../../../../core/services/salary.service';
import { Salary } from '../../../../core/models';

@Component({
  selector: 'app-salary-overview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './salary-overview.component.html',
  styleUrl: './salary-overview.component.scss'
})
export class SalaryOverviewComponent implements OnInit {
  currentSalary: Salary | null = null;
  salaries: Salary[] = [];
  salaryForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showModal = false;
  editingSalary: Salary | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly salaryService: SalaryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCurrentSalary();
    this.loadSalaryHistory();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.salaryForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: ['MAD', Validators.required],
      effectiveDate: [today, Validators.required],
      description: ['', Validators.maxLength(255)]
    });
  }

  loadCurrentSalary(): void {
    this.salaryService.getCurrentSalary().subscribe({
      next: (salary) => {
        this.currentSalary = salary;
      },
      error: (error) => {
        console.error('Error loading current salary:', error);
        // No current salary is ok, user can set one
      }
    });
  }

  loadSalaryHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.salaryService.getAllSalaries().subscribe({
      next: (salaries) => {
        this.salaries = [...salaries].sort((a, b) =>
          new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading salary history:', error);
        this.errorMessage = 'Failed to load salary history';
        this.isLoading = false;
      }
    });
  }

  openAddModal(): void {
    this.editingSalary = null;
    const today = new Date().toISOString().split('T')[0];
    this.salaryForm.reset({
      amount: '',
      currency: 'MAD',
      effectiveDate: today,
      description: ''
    });
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditModal(salary: Salary): void {
    this.editingSalary = salary;
    this.salaryForm.patchValue({
      amount: salary.amount,
      currency: salary.currency || 'MAD',
      effectiveDate: salary.effectiveDate?.toString().split('T')[0],
      description: salary.description || ''
    });
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingSalary = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (this.salaryForm.invalid) {
      Object.keys(this.salaryForm.controls).forEach(key => {
        this.salaryForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const salaryData: SalaryRequest = {
      amount: Number(this.salaryForm.value.amount),
      currency: this.salaryForm.value.currency,
      effectiveDate: this.salaryForm.value.effectiveDate,
      description: this.salaryForm.value.description || undefined
    };

    if (this.editingSalary) {
      this.updateSalary(this.editingSalary.id, salaryData);
    } else {
      this.createSalary(salaryData);
    }
  }

  private createSalary(data: SalaryRequest): void {
    this.salaryService.createSalary(data).subscribe({
      next: (salary) => {
        this.salaries.unshift(salary);
        this.loadCurrentSalary();
        this.successMessage = 'Salary added successfully!';
        this.isSubmitting = false;
        setTimeout(() => this.closeModal(), 1000);
      },
      error: (error) => {
        console.error('Error creating salary:', error);
        this.errorMessage = error.error?.message || 'Failed to add salary';
        this.isSubmitting = false;
      }
    });
  }

  private updateSalary(id: string, data: SalaryRequest): void {
    this.salaryService.updateSalary(id, data).subscribe({
      next: (updatedSalary) => {
        const index = this.salaries.findIndex(s => s.id === id);
        if (index !== -1) {
          this.salaries[index] = updatedSalary;
        }
        this.loadCurrentSalary();
        this.successMessage = 'Salary updated successfully!';
        this.isSubmitting = false;
        setTimeout(() => this.closeModal(), 1000);
      },
      error: (error) => {
        console.error('Error updating salary:', error);
        this.errorMessage = error.error?.message || 'Failed to update salary';
        this.isSubmitting = false;
      }
    });
  }

  deleteSalary(salary: Salary): void {
    if (!confirm('Are you sure you want to delete this salary entry?')) {
      return;
    }

    this.salaryService.deleteSalary(salary.id).subscribe({
      next: () => {
        this.salaries = this.salaries.filter(s => s.id !== salary.id);
        if (this.currentSalary?.id === salary.id) {
          this.loadCurrentSalary();
        }
      },
      error: (error) => {
        console.error('Error deleting salary:', error);
        this.errorMessage = error.error?.message || 'Failed to delete salary';
      }
    });
  }

  formatCurrency(amount: number, currency: string = 'MAD'): string {
    return new Intl.NumberFormat('en-MA', {
      style: 'currency',
      currency: currency === 'MAD' ? 'MAD' : currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Form field getters
  get amount() { return this.salaryForm.get('amount'); }
  get currency() { return this.salaryForm.get('currency'); }
  get effectiveDate() { return this.salaryForm.get('effectiveDate'); }
  get description() { return this.salaryForm.get('description'); }
}
