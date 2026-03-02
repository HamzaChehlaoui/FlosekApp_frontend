import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../../../core/components/header/header.component';
import { SavingsGoalService } from '../../../../core/services';
import { SavingsGoal } from '../../../../core/models';

interface SavingsGoalDisplay {
  id: string;
  name: string;
  emoji: string;
  color: string;
  current: number;
  target: number;
  percentage: number;
  deadline?: Date;
  status: 'active' | 'completed' | 'paused';
}

interface SavingsTip {
  icon: string;
  title: string;
  description: string;
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
  imports: [CommonModule, HeaderComponent, TranslateModule],
  templateUrl: './savings-goals.component.html',
  styleUrl: './savings-goals.component.scss'
})
export class SavingsGoalsComponent implements OnInit {
  // Loading & Error states
  isLoading = true;
  errorMessage = '';

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
      title: 'Set Clear Goals',
      description: 'Define specific, measurable savings targets with deadlines',
      category: 'strategy'
    },
    {
      icon: '💰',
      title: 'Automate Savings',
      description: 'Set up automatic transfers to your savings account each month',
      category: 'tip'
    },
    {
      icon: '📊',
      title: 'Track Progress',
      description: 'Review your savings goals weekly to stay motivated',
      category: 'motivation'
    },
    {
      icon: '🔄',
      title: '50/30/20 Rule',
      description: 'Allocate 20% of income to savings and debt repayment',
      category: 'strategy'
    }
  ];

  constructor(private readonly savingsGoalService: SavingsGoalService) {}

  ngOnInit(): void {
    this.loadSavingsData();
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
        this.errorMessage = 'Failed to load savings goals. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapGoalToDisplay(goal: SavingsGoal, status: 'active' | 'completed'): SavingsGoalDisplay {
    return {
      id: goal.id,
      name: goal.name,
      emoji: goal.icon || '🎯',
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
    if (!deadline) return 'No deadline';
    return new Date(deadline).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
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
    // Navigate to add goal page or open modal
    console.log('Open add goal');
  }

  addContribution(goalId: string): void {
    const amount = prompt('Enter contribution amount:');
    if (amount && !Number.isNaN(Number(amount))) {
      this.savingsGoalService.addContribution(goalId, { amount: Number(amount) }).subscribe({
        next: (updatedGoal) => {
          const index = this.activeGoals.findIndex(g => g.id === goalId);
          if (index !== -1) {
            this.activeGoals[index] = this.mapGoalToDisplay(updatedGoal, 'active');
            if (updatedGoal.isCompleted) {
              this.completedGoals.push(this.mapGoalToDisplay(updatedGoal, 'completed'));
              this.activeGoals = this.activeGoals.filter(g => g.id !== goalId);
            }
          }
          this.calculateSummary();
        },
        error: (error) => {
          console.error('Error adding contribution:', error);
          alert('Failed to add contribution. Please try again.');
        }
      });
    }
  }

  editGoal(goalId: string): void {
    // Navigate to edit goal page or open modal
    console.log('Edit goal:', goalId);
  }

  deleteGoal(goalId: string): void {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      this.savingsGoalService.deleteSavingsGoal(goalId).subscribe({
        next: () => {
          this.activeGoals = this.activeGoals.filter(goal => goal.id !== goalId);
          this.completedGoals = this.completedGoals.filter(goal => goal.id !== goalId);
          this.calculateSummary();
        },
        error: (error) => {
          console.error('Error deleting goal:', error);
          alert('Failed to delete savings goal. Please try again.');
        }
      });
    }
  }
}
