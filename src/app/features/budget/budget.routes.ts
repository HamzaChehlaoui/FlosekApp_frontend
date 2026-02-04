import { Routes } from '@angular/router';

export const budgetRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/budget-planner/budget-planner.component').then(m => m.BudgetPlannerComponent)
    }
];
