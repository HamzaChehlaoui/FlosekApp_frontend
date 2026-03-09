import { Routes } from '@angular/router';

export const savingsRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/savings-goals/savings-goals.component').then(m => m.SavingsGoalsComponent)
    },
    {
        path: 'add',
        loadComponent: () => import('./pages/add-goal/add-goal.component').then(m => m.AddGoalComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./pages/add-goal/add-goal.component').then(m => m.AddGoalComponent)
    }
];
