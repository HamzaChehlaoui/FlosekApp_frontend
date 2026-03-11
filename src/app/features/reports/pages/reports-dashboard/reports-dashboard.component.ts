import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../../../../core/components/header/header.component';
import { ReportService } from '../../../../core/services';
import {
  ReportData,
  MonthlyReportData,
  CategoryReportData,
  TopExpenseData,
  FinancialMetric
} from '../../../../core/models';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink, TranslateModule],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.scss'
})
export class ReportsDashboardComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly translate = inject(TranslateService);

  currentPeriod = '';
  isLoading = false;
  error: string | null = null;
  hasRealData = false;
  exportError: string | null = null;

  // Financial Metrics
  totalIncome = 0;
  totalExpenses = 0;
  netSavings = 0;
  savingsRate = 0;

  // Monthly Comparison
  monthlyData: MonthlyReportData[] = [];

  // Category Breakdown
  categorySpending: CategoryReportData[] = [];

  // Key Metrics
  keyMetrics: FinancialMetric[] = [];

  // Top Expenses
  topExpenses: TopExpenseData[] = [];

  ngOnInit(): void {
    this.loadReportsData();
  }

  loadReportsData(): void {
    this.isLoading = true;
    this.error = null;

    this.reportService.getComparisonReport(6).subscribe({
      next: (report: ReportData) => {
        this.currentPeriod = report.periodLabel;
        this.monthlyData = report.monthlyData;
        this.categorySpending = report.categoryBreakdown;
        this.topExpenses = report.topExpenses;

        // Set financial summary
        this.totalIncome = report.totalIncome;
        this.totalExpenses = report.totalExpenses;
        this.netSavings = report.netSavings;
        this.savingsRate = report.savingsRate;

        // Calculate key metrics
        this.calculateMetrics(report);
        this.hasRealData = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.error = 'Failed to load report data';
        this.isLoading = false;
      }
    });
  }

  calculateMetrics(report: ReportData): void {
    this.keyMetrics = [
      {
        label: 'reports.metrics.totalIncome',
        value: report.totalIncome,
        change: Math.abs(report.incomeChange),
        trend: report.incomeChange >= 0 ? 'up' : 'down',
        icon: 'income',
        color: '#10b981'
      },
      {
        label: 'reports.metrics.totalExpenses',
        value: report.totalExpenses,
        change: Math.abs(report.expenseChange),
        trend: report.expenseChange >= 0 ? 'up' : 'down',
        icon: 'expense',
        color: '#ef4444'
      },
      {
        label: 'reports.metrics.netSavings',
        value: report.netSavings,
        change: Math.abs(report.savingsChange),
        trend: report.savingsChange >= 0 ? 'up' : 'down',
        icon: 'savings',
        color: '#3b82f6'
      },
      {
        label: 'reports.metrics.savingsRate',
        value: report.savingsRate,
        change: Math.abs(report.savingsChange),
        trend: report.savingsChange >= 0 ? 'up' : 'down',
        icon: 'rate',
        color: '#8b5cf6'
      }
    ];
  }

  getMaxValue(): number {
    if (this.monthlyData.length === 0) return 1;
    return Math.max(
      ...this.monthlyData.map(m => Math.max(m.income, m.expenses, m.savings))
    );
  }

  getBarHeight(value: number): number {
    const max = this.getMaxValue();
    return max > 0 ? (value / max) * 100 : 0;
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  exportReport(): void {
    if (!this.hasRealData) {
      this.exportError = 'Cannot export report: No real data available. Please check your connection and try again.';
      setTimeout(() => this.exportError = null, 5000);
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('Financial Report', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Period & Date
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`${this.currentPeriod} — Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 14;

    // Key Metrics Summary
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Key Metrics', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value', 'Change']],
      body: this.keyMetrics.map(m => [
        this.translate.instant(m.label),
        m.icon === 'rate' ? `${m.value}%` : `${m.value.toLocaleString()} MAD`,
        `${m.trend === 'up' ? '+' : '-'}${m.change.toFixed(1)}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Monthly Trends Table
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Monthly Trends', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Month', 'Income (MAD)', 'Expenses (MAD)', 'Savings (MAD)']],
      body: this.monthlyData.map(m => [
        `${m.month} ${m.year}`,
        m.income.toLocaleString(),
        m.expenses.toLocaleString(),
        m.savings.toLocaleString()
      ]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Category Breakdown Table
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Category Breakdown', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Amount (MAD)', 'Percentage', 'Trend']],
      body: this.categorySpending.map(c => [
        c.name,
        c.amount.toLocaleString(),
        `${c.percentage}%`,
        `${c.trend} (${c.change >= 0 ? '+' : ''}${c.change}%)`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Check if we need a new page for top expenses
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Top Expenses Table
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Top Expenses', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Category', 'Amount (MAD)', 'Date']],
      body: this.topExpenses.map(e => [
        e.description,
        e.category,
        e.amount.toLocaleString(),
        this.formatDate(e.date)
      ]),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: 14, right: 14 }
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${totalPages} — Flosek Financial Report`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  changeTimePeriod(period: string): void {
    switch (period) {
      case 'monthly':
        this.reportService.getMonthlyReport().subscribe({
          next: (report) => this.updateReportData(report),
          error: (err) => console.error('Error loading monthly report:', err)
        });
        break;
      case 'yearly':
        this.reportService.getYearlyReport().subscribe({
          next: (report) => this.updateReportData(report),
          error: (err) => console.error('Error loading yearly report:', err)
        });
        break;
      default:
        this.loadReportsData();
    }
  }

  private updateReportData(report: ReportData): void {
    this.currentPeriod = report.periodLabel;
    this.monthlyData = report.monthlyData;
    this.categorySpending = report.categoryBreakdown;
    this.topExpenses = report.topExpenses;
    this.totalIncome = report.totalIncome;
    this.totalExpenses = report.totalExpenses;
    this.netSavings = report.netSavings;
    this.savingsRate = report.savingsRate;
    this.calculateMetrics(report);
  }
}
