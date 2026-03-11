import { Routes } from '@angular/router';

export const expensesRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/expenses-list/expenses-list.component').then(m => m.ExpensesListComponent)
    },
    {
        path: 'add',
        loadComponent: () => import('./pages/add-expense/add-expense.component').then(m => m.AddExpenseComponent)
    },
    {
        path: 'add/:id',
        loadComponent: () => import('./pages/add-expense/add-expense.component').then(m => m.AddExpenseComponent)
    },
    {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
    }
];
