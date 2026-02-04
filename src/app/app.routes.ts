import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/home/pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'salary',
    loadChildren: () => import('./features/salary/salary.routes').then(m => m.salaryRoutes)
  },
  {
    path: 'expenses',
    loadChildren: () => import('./features/expenses/expenses.routes').then(m => m.expensesRoutes)
  },
  {
    path: 'budget',
    loadChildren: () => import('./features/budget/budget.routes').then(m => m.budgetRoutes)
  },
  {
    path: 'savings',
    loadChildren: () => import('./features/savings/savings.routes').then(m => m.savingsRoutes)
  },
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.routes').then(m => m.reportsRoutes)
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes').then(m => m.settingsRoutes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
