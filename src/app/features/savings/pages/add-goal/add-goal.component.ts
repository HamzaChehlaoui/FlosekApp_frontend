import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../../../core/components/header/header.component';
import { SavingsGoalService, IconService } from '../../../../core/services';
import { SavingsGoalRequest } from '../../../../core/services/savings-goal.service';
import { IconOption } from '../../../../core/services/icon.service';

@Component({
  selector: 'app-add-goal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, HeaderComponent],
  templateUrl: './add-goal.component.html',
  styleUrl: './add-goal.component.scss'
})
export class AddGoalComponent implements OnInit {
  goalForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  goalId: string | null = null;

  // Icons
  iconCategories: Record<string, IconOption[]> = {};
  availableIcons: IconOption[] = [];
  selectedIconTab = 'Popular';
  iconSearch = '';

  // Available colors
  readonly colors = [
    '#10b981', '#22c55e', '#3b82f6', '#6366f1',
    '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444',
    '#14b8a6', '#06b6d4', '#f97316', '#84cc16'
  ];

  private readonly iconService = inject(IconService);

  constructor(
    private readonly fb: FormBuilder,
    private readonly savingsGoalService: SavingsGoalService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadIcons();
    this.checkEditMode();
  }

  private initForm(): void {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const defaultDate = nextYear.toISOString().split('T')[0];

    this.goalForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      targetAmount: ['', [Validators.required, Validators.min(1)]],
      targetDate: [defaultDate],
      description: ['', Validators.maxLength(500)],
      icon: ['savings'],
      color: ['#10b981']
    });
  }

  private loadIcons(): void {
    this.iconCategories = this.iconService.getAllIconsByCategory();
    this.filterIcons();
  }

  filterIcons(): void {
    if (this.iconSearch.trim()) {
      this.availableIcons = this.iconService.searchIcons(this.iconSearch);
      this.selectedIconTab = '';
    } else if (this.selectedIconTab === 'Popular') {
      this.availableIcons = this.iconService.getPopularIcons();
    } else if (this.selectedIconTab) {
      this.availableIcons = this.iconCategories[this.selectedIconTab] || [];
    } else {
      this.availableIcons = this.iconService.getPopularIcons();
    }
  }

  selectTab(tab: string): void {
    this.selectedIconTab = tab;
    this.iconSearch = '';
    this.filterIcons();
  }

  onSearchChange(): void {
    this.filterIcons();
  }

  clearSearch(): void {
    this.iconSearch = '';
    this.selectedIconTab = 'Popular';
    this.filterIcons();
  }

  get iconTabs(): string[] {
    return ['Popular', ...this.iconService.getCategories()];
  }

  private checkEditMode(): void {
    this.goalId = this.route.snapshot.paramMap.get('id');
    if (this.goalId) {
      this.isEditMode = true;
      this.loadGoalForEdit(this.goalId);
    }
  }

  private loadGoalForEdit(id: string): void {
    this.isLoading = true;
    this.savingsGoalService.getSavingsGoalById(id).subscribe({
      next: (goal) => {
        this.goalForm.patchValue({
          name: goal.name,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate ? goal.targetDate.toString().split('T')[0] : '',
          description: goal.description || '',
          icon: goal.icon || 'savings',
          color: goal.color || '#10b981'
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading goal:', error);
        this.errorMessage = 'Failed to load goal data';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.goalForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const goalData: SavingsGoalRequest = {
      name: this.goalForm.value.name,
      targetAmount: Number(this.goalForm.value.targetAmount),
      targetDate: this.goalForm.value.targetDate || undefined,
      description: this.goalForm.value.description || undefined,
      icon: this.goalForm.value.icon,
      color: this.goalForm.value.color
    };

    if (this.isEditMode && this.goalId) {
      this.updateGoal(goalData);
    } else {
      this.createGoal(goalData);
    }
  }

  private createGoal(data: SavingsGoalRequest): void {
    this.savingsGoalService.createSavingsGoal(data).subscribe({
      next: () => {
        this.successMessage = 'Goal created successfully!';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/savings']), 1500);
      },
      error: (error) => {
        console.error('Error creating goal:', error);
        this.errorMessage = error.error?.message || 'Failed to create goal';
        this.isSubmitting = false;
      }
    });
  }

  private updateGoal(data: SavingsGoalRequest): void {
    this.savingsGoalService.updateSavingsGoal(this.goalId!, data).subscribe({
      next: () => {
        this.successMessage = 'Goal updated successfully!';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/savings']), 1500);
      },
      error: (error) => {
        console.error('Error updating goal:', error);
        this.errorMessage = error.error?.message || 'Failed to update goal';
        this.isSubmitting = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.goalForm.controls).forEach(key => {
      this.goalForm.get(key)?.markAsTouched();
    });
  }

  selectIcon(icon: string): void {
    this.goalForm.patchValue({ icon });
  }

  selectColor(color: string): void {
    this.goalForm.patchValue({ color });
  }

  onCancel(): void {
    this.router.navigate(['/savings']);
  }

  // Form field getters
  get name() { return this.goalForm.get('name'); }
  get targetAmount() { return this.goalForm.get('targetAmount'); }
  get targetDate() { return this.goalForm.get('targetDate'); }
  get description() { return this.goalForm.get('description'); }
  get selectedIcon() { return this.goalForm.get('icon')?.value; }
  get selectedColor() { return this.goalForm.get('color')?.value; }
}
