import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../../../core/components/header/header.component';
import { SalaryService } from '../../../../core/services';
import { Salary } from '../../../../core/models';

@Component({
  selector: 'app-salary-history',
  standalone: true,
  imports: [CommonModule, TranslateModule, HeaderComponent],
  templateUrl: './salary-history.component.html',
  styleUrl: './salary-history.component.scss'
})
export class SalaryHistoryComponent implements OnInit {
  salaries: Salary[] = [];
  isLoading = false;
  errorMessage = '';

  // Statistics
  highestSalary: number = 0;
  lowestSalary: number = 0;
  averageSalary: number = 0;
  totalGrowth: number = 0;

  constructor(private readonly salaryService: SalaryService) {}

  ngOnInit(): void {
    this.loadSalaryHistory();
  }

  loadSalaryHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.salaryService.getAllSalaries().subscribe({
      next: (salaries) => {
        this.salaries = [...salaries].sort((a, b) =>
          new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
        );
        this.calculateStatistics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading salary history:', error);
        this.errorMessage = 'Failed to load salary history';
        this.isLoading = false;
      }
    });
  }

  private calculateStatistics(): void {
    if (this.salaries.length === 0) return;

    const amounts = this.salaries.map(s => s.amount);
    this.highestSalary = Math.max(...amounts);
    this.lowestSalary = Math.min(...amounts);
    this.averageSalary = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Calculate growth from first to current salary
    if (this.salaries.length >= 2) {
      const oldest = this.salaries.at(-1)?.amount ?? 0;
      const current = this.salaries[0].amount;
      this.totalGrowth = oldest > 0 ? ((current - oldest) / oldest) * 100 : 0;
    }
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
      month: 'short'
    });
  }

  getBarHeight(amount: number): number {
    if (this.highestSalary === 0) return 0;
    return (amount / this.highestSalary) * 100;
  }
}
