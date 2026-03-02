import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryService, IconService } from '../../../../core/services';
import { CategoryRequest } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models';
import { IconOption } from '../../../../core/services/icon.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  categoryForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showModal = false;
  editingCategory: Category | null = null;

  // Icons
  iconCategories: Record<string, IconOption[]> = {};
  availableIcons: IconOption[] = [];
  selectedIconTab = 'Popular';
  iconSearch = '';

  // Colors
  readonly colorOptions = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#d946ef', '#ec4899',
  ];

  private readonly iconService = inject(IconService);

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadIcons();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(255)],
      color: ['#3b82f6', Validators.required],
      icon: ['category', Validators.required]
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

  // --- Category CRUD ---

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load categories';
        this.isLoading = false;
      }
    });
  }

  openAddModal(): void {
    this.editingCategory = null;
    this.categoryForm.reset({ name: '', description: '', color: '#3b82f6', icon: 'category' });
    this.selectedIconTab = 'Popular';
    this.iconSearch = '';
    this.filterIcons();
    this.errorMessage = '';
    this.successMessage = '';
    this.showModal = true;
  }

  openEditModal(cat: Category): void {
    this.editingCategory = cat;
    this.categoryForm.patchValue({
      name: cat.name,
      description: cat.description || '',
      color: cat.color || '#3b82f6',
      icon: cat.icon || 'category'
    });
    this.selectedIconTab = 'Popular';
    this.iconSearch = '';
    this.filterIcons();
    this.errorMessage = '';
    this.successMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      Object.keys(this.categoryForm.controls).forEach(k => this.categoryForm.get(k)?.markAsTouched());
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    const data: CategoryRequest = {
      name: this.categoryForm.value.name,
      description: this.categoryForm.value.description || undefined,
      color: this.categoryForm.value.color,
      icon: this.categoryForm.value.icon
    };

    if (this.editingCategory) {
      this.updateCategory(this.editingCategory.id, data);
    } else {
      this.createCategory(data);
    }
  }

  private createCategory(data: CategoryRequest): void {
    this.categoryService.createCategory(data).subscribe({
      next: (cat) => {
        this.categories.push(cat);
        this.successMessage = 'Category created!';
        this.isSubmitting = false;
        setTimeout(() => this.closeModal(), 800);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create category';
        this.isSubmitting = false;
      }
    });
  }

  private updateCategory(id: string, data: CategoryRequest): void {
    this.categoryService.updateCategory(id, data).subscribe({
      next: (updated) => {
        const idx = this.categories.findIndex(c => c.id === id);
        if (idx !== -1) this.categories[idx] = updated;
        this.successMessage = 'Category updated!';
        this.isSubmitting = false;
        setTimeout(() => this.closeModal(), 800);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update category';
        this.isSubmitting = false;
      }
    });
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    this.categoryService.deleteCategory(cat.id).subscribe({
      next: () => this.categories = this.categories.filter(c => c.id !== cat.id),
      error: (err) => this.errorMessage = err.error?.message || 'Failed to delete category'
    });
  }

  selectColor(color: string): void {
    this.categoryForm.patchValue({ color });
  }

  selectIcon(icon: string): void {
    this.categoryForm.patchValue({ icon });
  }

  // Form getters
  get name() { return this.categoryForm.get('name'); }
  get description() { return this.categoryForm.get('description'); }
  get color() { return this.categoryForm.get('color'); }
  get icon() { return this.categoryForm.get('icon'); }
}
