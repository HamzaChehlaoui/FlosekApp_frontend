import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../../core/components/header/header.component';

interface SavingsGoal {
  id: number;
  name: string;
  emoji: string;
  color: string;
  current: number;
  target: number;
  percentage: number;
  deadline?: Date;
  status: 'active' | 'completed' | 'paused';
  monthlyContribution?: number;
}

interface Contribution {
  id: number;
  goalId: number;
  goalName: string;
  goalColor: string;
  amount: number;
  date: Date;
  note?: string;
}

interface SavingsTip {
  icon: string;
  title: string;
  description: string;
  category: 'strategy' | 'motivation' | 'tip';
}

@Component({
  selector: 'app-savings-goals',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink],
  templateUrl: './savings-goals.component.html',
  styleUrl: './savings-goals.component.scss'
})
export class SavingsGoalsComponent implements OnInit {
  // Summary Stats
  totalSaved = 0;
  totalTarget = 0;
  activeGoalsCount = 0;
  completedGoalsCount = 0;
  overallPercentage = 0;

  // Goals
  activeGoals: SavingsGoal[] = [];
  completedGoals: SavingsGoal[] = [];

  // Recent Contributions
  recentContributions: Contribution[] = [];

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

  ngOnInit(): void {
    this.loadSavingsData();
    this.calculateSummary();
  }

  loadSavingsData(): void {
    // Mock data - Replace with actual API calls
    this.activeGoals = [
      {
        id: 1,
        name: 'New Car',
        emoji: '🚗',
        color: '#10b981',
        current: 24000,
        target: 40000,
        percentage: 60,
        deadline: new Date('2026-12-31'),
        status: 'active',
        monthlyContribution: 2000
      },
      {
        id: 2,
        name: 'Emergency Fund',
        emoji: '🏦',
        color: '#3b82f6',
        current: 8500,
        target: 10000,
        percentage: 85,
        status: 'active',
        monthlyContribution: 500
      },
      {
        id: 3,
        name: 'Vacation',
        emoji: '✈️',
        color: '#f59e0b',
        current: 3200,
        target: 8000,
        percentage: 40,
        deadline: new Date('2026-08-15'),
        status: 'active',
        monthlyContribution: 800
      },
      {
        id: 4,
        name: 'Home Renovation',
        emoji: '🏠',
        color: '#8b5cf6',
        current: 15000,
        target: 25000,
        percentage: 60,
        status: 'active',
        monthlyContribution: 1500
      },
      {
        id: 5,
        name: 'Education Fund',
        emoji: '📚',
        color: '#ec4899',
        current: 5000,
        target: 15000,
        percentage: 33,
        deadline: new Date('2027-09-01'),
        status: 'active',
        monthlyContribution: 600
      },
      {
        id: 6,
        name: 'Investment Portfolio',
        emoji: '📈',
        color: '#06b6d4',
        current: 12000,
        target: 30000,
        percentage: 40,
        status: 'active',
        monthlyContribution: 1000
      }
    ];

    this.completedGoals = [
      {
        id: 101,
        name: 'Laptop',
        emoji: '💻',
        color: '#10b981',
        current: 5000,
        target: 5000,
        percentage: 100,
        status: 'completed'
      },
      {
        id: 102,
        name: 'Wedding Gift',
        emoji: '💍',
        color: '#ec4899',
        current: 2000,
        target: 2000,
        percentage: 100,
        status: 'completed'
      }
    ];

    this.recentContributions = [
      {
        id: 1,
        goalId: 1,
        goalName: 'New Car',
        goalColor: '#10b981',
        amount: 2000,
        date: new Date('2026-02-10'),
        note: 'Monthly contribution'
      },
      {
        id: 2,
        goalId: 3,
        goalName: 'Vacation',
        goalColor: '#f59e0b',
        amount: 800,
        date: new Date('2026-02-08'),
        note: 'Monthly contribution'
      },
      {
        id: 3,
        goalId: 2,
        goalName: 'Emergency Fund',
        goalColor: '#3b82f6',
        amount: 500,
        date: new Date('2026-02-05'),
        note: 'Monthly contribution'
      },
      {
        id: 4,
        goalId: 4,
        goalName: 'Home Renovation',
        goalColor: '#8b5cf6',
        amount: 1500,
        date: new Date('2026-02-03'),
        note: 'Monthly contribution'
      },
      {
        id: 5,
        goalId: 1,
        goalName: 'New Car',
        goalColor: '#10b981',
        amount: 1000,
        date: new Date('2026-01-28'),
        note: 'Bonus contribution'
      }
    ];
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
    return months > 0 ? months : 0;
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
    // TODO: Navigate to add goal or open modal
    console.log('Open add goal');
  }

  addContribution(goalId: number): void {
    // TODO: Navigate to add contribution or open modal
    console.log('Add contribution to goal:', goalId);
  }

  editGoal(goalId: number): void {
    // TODO: Navigate to edit goal or open modal
    console.log('Edit goal:', goalId);
  }

  deleteGoal(goalId: number): void {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      this.activeGoals = this.activeGoals.filter(goal => goal.id !== goalId);
      this.calculateSummary();
    }
  }
}
