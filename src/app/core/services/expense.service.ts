import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Expense } from '../models';

export interface ExpenseRequest {
  amount: number;
  description?: string;
  expenseDate: string;
  categoryId: string;
  notes?: string;
  isRecurring?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all expenses for the authenticated user
   */
  getAllExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }

  /**
   * Get expenses within a date range
   */
  getExpensesByDateRange(startDate: string, endDate: string): Observable<Expense[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Expense[]>(this.apiUrl, { params });
  }

  /**
   * Get expense by ID
   */
  getExpenseById(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new expense
   */
  createExpense(expense: ExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  /**
   * Update an existing expense
   */
  updateExpense(id: string, expense: ExpenseRequest): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  /**
   * Delete an expense
   */
  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
