import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Budget } from '../models';

export interface BudgetRequest {
  amount: number;
  startDate: string;
  endDate: string;
  categoryId: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private readonly apiUrl = `${environment.apiUrl}/budgets`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all budgets for the authenticated user
   */
  getAllBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  /**
   * Get active budgets (current date within budget period)
   */
  getActiveBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/active`);
  }

  /**
   * Get budget by ID
   */
  getBudgetById(id: string): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new budget
   */
  createBudget(budget: BudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, budget);
  }

  /**
   * Update an existing budget
   */
  updateBudget(id: string, budget: BudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, budget);
  }

  /**
   * Delete a budget
   */
  deleteBudget(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
