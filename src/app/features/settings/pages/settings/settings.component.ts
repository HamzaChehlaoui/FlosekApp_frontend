import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, LanguageService } from '../../../../core/services';
import { Language } from '../../../../core/services/language.service';
import { HeaderComponent } from '../../../../core/components/header/header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, TranslateModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  // Language settings
  languages: Language[] = [];
  currentLanguage: Language | null = null;

  // Currency settings
  currencies = [
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' }
  ];
  selectedCurrency = 'MAD';

  // Theme settings
  themes = [
    { id: 'light', name: 'Light', icon: '☀️' },
    { id: 'dark', name: 'Dark', icon: '🌙' },
    { id: 'system', name: 'System', icon: '💻' }
  ];
  selectedTheme = 'light';

  // Notification settings
  notifications = {
    budgetAlerts: true,
    savingsReminders: true,
    weeklyReport: true,
    pushNotifications: false
  };

  // Data & Privacy
  showDeleteConfirm = false;
  isDeleting = false;

  // Messages
  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly languageService: LanguageService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    // Load language settings
    this.languages = this.languageService.getLanguages();
    this.currentLanguage = this.languageService.getCurrentLanguage();

    // Load saved preferences from localStorage
    this.selectedCurrency = localStorage.getItem('flosek_currency') || 'MAD';
    this.selectedTheme = localStorage.getItem('flosek_theme') || 'light';

    const savedNotifications = localStorage.getItem('flosek_notifications');
    if (savedNotifications) {
      this.notifications = { ...this.notifications, ...JSON.parse(savedNotifications) };
    }
  }

  onLanguageChange(langCode: string): void {
    this.languageService.setLanguage(langCode);
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.showSuccess('Language updated');
  }

  onCurrencyChange(): void {
    localStorage.setItem('flosek_currency', this.selectedCurrency);
    this.showSuccess('Currency updated');
  }

  onThemeChange(themeId: string): void {
    this.selectedTheme = themeId;
    localStorage.setItem('flosek_theme', themeId);
    this.applyTheme(themeId);
    this.showSuccess('Theme updated');
  }

  private applyTheme(theme: string): void {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');

    if (theme === 'system') {
      const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      root.classList.add(`theme-${theme}`);
    }
  }

  onNotificationChange(): void {
    localStorage.setItem('flosek_notifications', JSON.stringify(this.notifications));
    this.showSuccess('Notification preferences saved');
  }

  exportData(): void {
    // Collect user data (this would typically come from an API)
    const exportData = {
      exportDate: new Date().toISOString(),
      settings: {
        language: this.currentLanguage?.code,
        currency: this.selectedCurrency,
        theme: this.selectedTheme,
        notifications: this.notifications
      }
    };

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flosek-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.showSuccess('Data exported successfully');
  }

  clearLocalData(): void {
    if (confirm('Clear all locally stored data? This will not affect your account data.')) {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('current_user');

      localStorage.clear();

      // Restore auth data
      if (token) localStorage.setItem('access_token', token);
      if (user) localStorage.setItem('current_user', user);

      this.loadSettings();
      this.showSuccess('Local data cleared');
    }
  }

  confirmDeleteAccount(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  deleteAccount(): void {
    this.isDeleting = true;
    // This would call an API to delete the account
    // For now, we'll just log out
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }, 1500);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
  }
}
