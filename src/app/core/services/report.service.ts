import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReportData, ReportRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Generate a custom report based on request parameters
   */
  generateReport(request: ReportRequest): Observable<ReportData> {
    return this.http.post<ReportData>(`${this.apiUrl}/generate`, request);
  }

  /**
   * Get monthly report for current month
   */
  getMonthlyReport(): Observable<ReportData> {
    return this.http.get<ReportData>(`${this.apiUrl}/monthly`);
  }

  /**
   * Get yearly report
   * @param year optional year (defaults to current year)
   */
  getYearlyReport(year?: number): Observable<ReportData> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<ReportData>(`${this.apiUrl}/yearly`, { params });
  }

  /**
   * Get comparison report showing trends over multiple months
   * @param months number of months to compare (defaults to 6)
   */
  getComparisonReport(months: number = 6): Observable<ReportData> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<ReportData>(`${this.apiUrl}/comparison`, { params });
  }
}
