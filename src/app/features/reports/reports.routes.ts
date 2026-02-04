import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/reports-dashboard/reports-dashboard.component').then(m => m.ReportsDashboardComponent)
    }
];
