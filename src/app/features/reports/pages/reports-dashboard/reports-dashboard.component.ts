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
  private readonly currencyCode = 'MAD';

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
    return new Date(date).toLocaleDateString(this.getCurrentLocale(), {
      month: 'short',
      day: 'numeric'
    });
  }

  private getCurrentLocale(): string {
    switch (this.translate.currentLang) {
      case 'ar':
        return 'ar-MA';
      case 'fr':
        return 'fr-FR';
      default:
        return 'en-US';
    }
  }

  private formatCurrency(value: number): string {
    return `${new Intl.NumberFormat(this.getCurrentLocale(), {
      maximumFractionDigits: 0
    }).format(value)} ${this.currencyCode}`;
  }

  private formatPercentage(value: number): string {
    return `${new Intl.NumberFormat(this.getCurrentLocale(), {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value)}%`;
  }

  private async loadImageAsDataUrl(path: string): Promise<string | null> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  private addPdfHeader(doc: jsPDF, pageWidth: number, logoDataUrl: string | null): number {
    const title = this.translate.instant('reports.title');
    const generatedOn = this.translate.instant('reports.pdf.generatedOn');
    const periodLabel = this.translate.instant('reports.pdf.period');

    // Logo and brand
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 40, 32, 36, 36);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39);
    doc.text('Flosek', logoDataUrl ? 84 : 40, 56);

    // Title
    doc.setFontSize(16);
    doc.setTextColor(55, 65, 81);
    doc.text(title, 40, 90);

    // Period and date info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`${periodLabel}: ${this.currentPeriod}`, 40, 110);
    doc.text(`${generatedOn}: ${new Date().toLocaleDateString(this.getCurrentLocale())}`, 40, 124);

    // Separator line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(1);
    doc.line(40, 140, pageWidth - 40, 140);

    return 160;
  }

  private addSummarySection(doc: jsPDF, y: number, pageWidth: number): number {
    const sectionTitle = this.translate.instant('reports.pdf.executiveSummary');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(sectionTitle, 40, y);

    y += 20;

    // Simple summary table
    const summaryData = [
      [this.translate.instant('reports.metrics.totalIncome'), this.formatCurrency(this.totalIncome)],
      [this.translate.instant('reports.metrics.totalExpenses'), this.formatCurrency(this.totalExpenses)],
      [this.translate.instant('reports.metrics.netSavings'), this.formatCurrency(this.netSavings)],
      [this.translate.instant('reports.metrics.savingsRate'), this.formatPercentage(this.savingsRate)]
    ];

    autoTable(doc, {
      startY: y,
      body: summaryData,
      theme: 'plain',
      styles: {
        fontSize: 11,
        cellPadding: { top: 8, bottom: 8, left: 12, right: 12 },
        textColor: [55, 65, 81]
      },
      columnStyles: {
        0: { fontStyle: 'normal', cellWidth: 200 },
        1: { fontStyle: 'bold', halign: 'right' }
      },
      margin: { left: 40, right: 40 },
      tableLineColor: [229, 231, 235],
      tableLineWidth: 0.5
    });

    return (doc as any).lastAutoTable.finalY + 24;
  }

  private addSectionTitle(doc: jsPDF, title: string, y: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(title, 40, y);

    return y + 16;
  }

  private addPdfFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
    const totalPages = doc.getNumberOfPages();
    const generatedBy = this.translate.instant('reports.pdf.generatedBy');

    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text(generatedBy, 40, pageHeight - 24);
      doc.text(`${page} / ${totalPages}`, pageWidth - 40, pageHeight - 24, { align: 'right' });
    }
  }

  async exportReport(): Promise<void> {
    if (!this.hasRealData) {
      this.exportError = 'Cannot export report: No real data available. Please check your connection and try again.';
      setTimeout(() => this.exportError = null, 5000);
      return;
    }

    const logoDataUrl = await this.loadImageAsDataUrl('/logo_flosek-.png');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Consistent table styling - simple gray theme
    const tableHead: [number, number, number] = [55, 65, 81];
    const tableText: [number, number, number] = [75, 85, 99];
    const tableAlt: [number, number, number] = [249, 250, 251];

    let y = this.addPdfHeader(doc, pageWidth, logoDataUrl);
    y = this.addSummarySection(doc, y, pageWidth);

    // Monthly Overview
    y = this.addSectionTitle(doc, this.translate.instant('reports.pdf.monthlyOverview'), y);

    autoTable(doc, {
      startY: y,
      head: [[
        this.translate.instant('reports.pdf.month'),
        this.translate.instant('reports.legend.income'),
        this.translate.instant('reports.legend.expenses'),
        this.translate.instant('reports.legend.savings')
      ]],
      body: this.monthlyData.map(m => [
        `${m.month} ${m.year}`,
        this.formatCurrency(m.income),
        this.formatCurrency(m.expenses),
        this.formatCurrency(m.savings)
      ]),
      theme: 'striped',
      headStyles: { fillColor: tableHead, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 10, textColor: tableText },
      alternateRowStyles: { fillColor: tableAlt },
      margin: { left: 40, right: 40 }
    });

    y = (doc as any).lastAutoTable.finalY + 28;

    // Category Breakdown
    y = this.addSectionTitle(doc, this.translate.instant('reports.pdf.categoryAnalysis'), y);

    autoTable(doc, {
      startY: y,
      head: [[
        this.translate.instant('budget.categories'),
        this.translate.instant('reports.pdf.amount'),
        this.translate.instant('reports.pdf.percentage'),
        this.translate.instant('reports.pdf.trend')
      ]],
      body: this.categorySpending.map(c => [
        c.name,
        this.formatCurrency(c.amount),
        this.formatPercentage(c.percentage),
        `${c.change >= 0 ? '+' : ''}${c.change}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: tableHead, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 10, textColor: tableText },
      alternateRowStyles: { fillColor: tableAlt },
      margin: { left: 40, right: 40 }
    });

    y = (doc as any).lastAutoTable.finalY + 28;

    // Check if we need a new page
    if (y > pageHeight - 180) {
      doc.addPage();
      y = 50;
    }

    // Top Expenses
    y = this.addSectionTitle(doc, this.translate.instant('reports.pdf.recentExpenses'), y);

    autoTable(doc, {
      startY: y,
      head: [[
        this.translate.instant('reports.pdf.description'),
        this.translate.instant('budget.categories'),
        this.translate.instant('reports.pdf.amount'),
        this.translate.instant('reports.pdf.date')
      ]],
      body: this.topExpenses.map(e => [
        e.description,
        e.category,
        this.formatCurrency(e.amount),
        this.formatDate(e.date)
      ]),
      theme: 'striped',
      headStyles: { fillColor: tableHead, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 10, textColor: tableText },
      alternateRowStyles: { fillColor: tableAlt },
      margin: { left: 40, right: 40 }
    });

    this.addPdfFooter(doc, pageWidth, pageHeight);

    doc.save(`flosek-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
