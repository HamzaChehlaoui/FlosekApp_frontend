import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SavingsGoal } from '../models';

export interface SavingsGoalRequest {
  name: string;
  targetAmount: number;
  targetDate?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface ContributionRequest {
  amount: number;
  note?: string;
}

export interface ContributionResponse {
  id: string;
  savingsGoalId: string;
  goalName: string;
  goalColor: string;
  amount: number;
  note: string;
  contributionDate: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SavingsGoalService {
  private readonly apiUrl = `${environment.apiUrl}/savings-goals`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all savings goals for the authenticated user
   */
  getAllSavingsGoals(): Observable<SavingsGoal[]> {
    return this.http.get<SavingsGoal[]>(this.apiUrl);
  }

  /**
   * Get active (not completed) savings goals
   */
  getActiveSavingsGoals(): Observable<SavingsGoal[]> {
    return this.http.get<SavingsGoal[]>(`${this.apiUrl}/active`);
  }

  /**
   * Get savings goal by ID
   */
  getSavingsGoalById(id: string): Observable<SavingsGoal> {
    return this.http.get<SavingsGoal>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new savings goal
   */
  createSavingsGoal(goal: SavingsGoalRequest): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(this.apiUrl, goal);
  }

  /**
   * Update an existing savings goal
   */
  updateSavingsGoal(id: string, goal: SavingsGoalRequest): Observable<SavingsGoal> {
    return this.http.put<SavingsGoal>(`${this.apiUrl}/${id}`, goal);
  }

  /**
   * Add contribution to a savings goal
   */
  addContribution(id: string, contribution: ContributionRequest): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(`${this.apiUrl}/${id}/contribute`, contribution);
  }

  /**
   * Get recent contributions for the authenticated user
   */
  getRecentContributions(limit: number = 5): Observable<ContributionResponse[]> {
    return this.http.get<ContributionResponse[]>(`${this.apiUrl}/contributions/recent`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Delete a savings goal
   */
  deleteSavingsGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
