import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardData } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get dashboard summary data for the authenticated user
   */
  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }
}
