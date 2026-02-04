import { Routes } from '@angular/router';

export const salaryRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/salary-overview/salary-overview.component').then(m => m.SalaryOverviewComponent)
    },
    {
        path: 'history',
        loadComponent: () => import('./pages/salary-history/salary-history.component').then(m => m.SalaryHistoryComponent)
    }
];
