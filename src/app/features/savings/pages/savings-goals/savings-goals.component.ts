import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../../../../core/components/header/header.component';
import { SavingsGoalService } from '../../../../core/services';
import { SavingsGoal } from '../../../../core/models';

interface SavingsGoalDisplay {
  id: string;
  name: string;
  icon: string;
  color: string;
  current: number;
  target: number;
  percentage: number;
  deadline?: Date;
  status: 'active' | 'completed' | 'paused';
}

interface SavingsTip {
  icon: string;
  titleKey: string;
  descriptionKey: string;
  category: 'strategy' | 'motivation' | 'tip';
}

interface RecentContribution {
  id: string;
  goalName: string;
  goalColor: string;
  amount: number;
  note: string;
  date: Date;
}

@Component({
  selector: 'app-savings-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, TranslateModule],
  templateUrl: './savings-goals.component.html',
  styleUrl: './savings-goals.component.scss'
})
export class SavingsGoalsComponent implements OnInit {
  // Loading & Error states
  isLoading = true;
  errorMessage = '';

  // Contribution Modal
  showContributionModal = false;
  contributionAmount: number | null = null;
  contributionNote = '';
  selectedGoalForContribution: SavingsGoalDisplay | null = null;
  isSubmittingContribution = false;

  // Delete Modal
  showDeleteModal = false;
  goalToDelete: SavingsGoalDisplay | null = null;
  isDeletingGoal = false;

  // Computed: remaining amount to reach goal
  get remainingAmount(): number {
    if (!this.selectedGoalForContribution) return 0;
    return Math.max(0, this.selectedGoalForContribution.target - this.selectedGoalForContribution.current);
  }

  get isOverContribution(): boolean {
    if (!this.contributionAmount || !this.selectedGoalForContribution) return false;
    return this.contributionAmount > this.remainingAmount;
  }

  // Summary Stats
  totalSaved = 0;
  totalTarget = 0;
  activeGoalsCount = 0;
  completedGoalsCount = 0;
  overallPercentage = 0;

  // Goals
  activeGoals: SavingsGoalDisplay[] = [];
  completedGoals: SavingsGoalDisplay[] = [];

  // Recent Contributions (empty for now - will be populated from API if available)
  recentContributions: RecentContribution[] = [];

  // Savings Tips
  savingsTips: SavingsTip[] = [
    {
      icon: '🎯',
      titleKey: 'savings.tips.clearGoals.title',
      descriptionKey: 'savings.tips.clearGoals.description',
      category: 'strategy'
    },
    {
      icon: '💰',
      titleKey: 'savings.tips.automate.title',
      descriptionKey: 'savings.tips.automate.description',
      category: 'tip'
    },
    {
      icon: '📊',
      titleKey: 'savings.tips.track.title',
      descriptionKey: 'savings.tips.track.description',
      category: 'motivation'
    },
    {
      icon: '🔄',
      titleKey: 'savings.tips.rule.title',
      descriptionKey: 'savings.tips.rule.description',
      category: 'strategy'
    }
  ];

  constructor(
    private readonly savingsGoalService: SavingsGoalService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  private getCurrentLocale(): string {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
    if (lang.startsWith('ar')) return 'ar-MA';
    if (lang.startsWith('fr')) return 'fr-FR';
    return 'en-US';
  }

  ngOnInit(): void {
    this.loadRecentContributions();
    this.loadSavingsData();
  }

  private loadRecentContributions(): void {
    this.savingsGoalService.getRecentContributions(5).subscribe({
      next: (contributions) => {
        this.recentContributions = contributions.map(c => ({
          id: c.id,
          goalName: c.goalName,
          goalColor: c.goalColor,
          amount: c.amount,
          note: c.note || this.translate.instant('savings.contributionDefaultNote'),
          date: new Date(c.contributionDate)
        }));
      },
      error: (error) => {
        console.error('Error loading recent contributions:', error);
        this.recentContributions = [];
      }
    });
  }

  loadSavingsData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.savingsGoalService.getAllSavingsGoals().subscribe({
      next: (goals) => {
        this.activeGoals = goals
          .filter(g => !g.isCompleted)
          .map(g => this.mapGoalToDisplay(g, 'active'));

        this.completedGoals = goals
          .filter(g => g.isCompleted)
          .map(g => this.mapGoalToDisplay(g, 'completed'));

        this.calculateSummary();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading savings goals:', error);
        this.errorMessage = this.translate.instant('savings.errors.loadFailed');
        this.isLoading = false;
      }
    });
  }

  private mapGoalToDisplay(goal: SavingsGoal, status: 'active' | 'completed'): SavingsGoalDisplay {
    return {
      id: goal.id,
      name: goal.name,
      icon: goal.icon || 'savings',
      color: goal.color || '#10b981',
      current: goal.currentAmount,
      target: goal.targetAmount,
      percentage: goal.progressPercentage || 0,
      deadline: goal.targetDate ? new Date(goal.targetDate) : undefined,
      status
    };
  }

  calculateSummary(): void {
    this.totalSaved = this.activeGoals.reduce((sum, goal) => sum + goal.current, 0);
    this.totalTarget = this.activeGoals.reduce((sum, goal) => sum + goal.target, 0);
    this.activeGoalsCount = this.activeGoals.length;
    this.completedGoalsCount = this.completedGoals.length;
    this.overallPercentage = this.totalTarget > 0
      ? Math.round((this.totalSaved / this.totalTarget) * 100)
      : 0;
  }

  getMonthsRemaining(deadline?: Date): number | null {
    if (!deadline) return null;
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const months = Math.ceil(diff / (1000 * 60 * 60 * 24 * 30));
    return Math.max(months, 0);
  }

  formatDeadline(deadline?: Date): string {
    if (!deadline) return this.translate.instant('savings.noDeadline');
    return new Date(deadline).toLocaleDateString(this.getCurrentLocale(), {
      month: 'short',
      year: 'numeric'
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString(this.getCurrentLocale(), {
      month: 'short',
      day: 'numeric'
    });
  }

  getProgressStatus(percentage: number): 'low' | 'medium' | 'high' | 'complete' {
    if (percentage >= 100) return 'complete';
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  }

  openAddGoal(): void {
    this.router.navigate(['/savings/add']);
  }

  addContribution(goalId: string): void {
    const goal = this.activeGoals.find(g => g.id === goalId);
    if (goal) {
      this.selectedGoalForContribution = goal;
      this.contributionAmount = null;
      this.contributionNote = '';
      this.showContributionModal = true;
    }
  }

  closeContributionModal(): void {
    this.showContributionModal = false;
    this.selectedGoalForContribution = null;
    this.contributionAmount = null;
    this.contributionNote = '';
    this.isSubmittingContribution = false;
  }

  fillRemainingAmount(): void {
    if (this.selectedGoalForContribution) {
      this.contributionAmount = this.remainingAmount;
    }
  }

  submitContribution(): void {
    if (!this.selectedGoalForContribution || !this.contributionAmount || this.contributionAmount <= 0) {
      return;
    }

    this.isSubmittingContribution = true;
    const goalId = this.selectedGoalForContribution.id;

    this.savingsGoalService.addContribution(goalId, {
      amount: this.contributionAmount,
      note: this.contributionNote || undefined
    }).subscribe({
      next: (updatedGoal) => {
        const index = this.activeGoals.findIndex(g => g.id === goalId);
        if (index !== -1) {
          this.activeGoals[index] = this.mapGoalToDisplay(updatedGoal, 'active');
          if (updatedGoal.isCompleted) {
            this.completedGoals.push(this.mapGoalToDisplay(updatedGoal, 'completed'));
            this.activeGoals = this.activeGoals.filter(g => g.id !== goalId);
          }
        }
        // Reload recent contributions from API
        this.loadRecentContributions();

        this.calculateSummary();
        this.closeContributionModal();
      },
      error: (error) => {
        console.error('Error adding contribution:', error);
        this.isSubmittingContribution = false;
      }
    });
  }

  editGoal(goalId: string): void {
    this.router.navigate(['/savings/edit', goalId]);
  }

  openDeleteModal(goalId: string): void {
    this.goalToDelete = this.activeGoals.find(goal => goal.id === goalId)
      || this.completedGoals.find(goal => goal.id === goalId)
      || null;
    this.showDeleteModal = !!this.goalToDelete;
    this.isDeletingGoal = false;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.goalToDelete = null;
    this.isDeletingGoal = false;
  }

  confirmDeleteGoal(): void {
    if (!this.goalToDelete || this.isDeletingGoal) return;

    this.isDeletingGoal = true;
    const goalId = this.goalToDelete.id;

    this.savingsGoalService.deleteSavingsGoal(goalId).subscribe({
      next: () => {
        this.activeGoals = this.activeGoals.filter(goal => goal.id !== goalId);
        this.completedGoals = this.completedGoals.filter(goal => goal.id !== goalId);
        this.calculateSummary();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting goal:', error);
        this.isDeletingGoal = false;
      }
    });
  }
}
