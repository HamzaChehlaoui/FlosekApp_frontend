import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Salary } from '../models';

export interface SalaryRequest {
  amount: number;
  currency?: string;
  effectiveDate: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalaryService {
  private readonly apiUrl = `${environment.apiUrl}/salaries`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all salaries for the authenticated user
   */
  getAllSalaries(): Observable<Salary[]> {
    return this.http.get<Salary[]>(this.apiUrl);
  }

  /**
   * Get current salary
   */
  getCurrentSalary(): Observable<Salary> {
    return this.http.get<Salary>(`${this.apiUrl}/current`);
  }

  /**
   * Create a new salary entry
   */
  createSalary(salary: SalaryRequest): Observable<Salary> {
    return this.http.post<Salary>(this.apiUrl, salary);
  }

  /**
   * Update an existing salary
   */
  updateSalary(id: string, salary: SalaryRequest): Observable<Salary> {
    return this.http.put<Salary>(`${this.apiUrl}/${id}`, salary);
  }

  /**
   * Delete a salary
   */
  deleteSalary(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
