import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly STORAGE_KEY = 'flosek_language';

  readonly languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flag: '🇸🇦' },
    { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', flag: '🇫🇷' }
  ];

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const savedLang = localStorage.getItem(this.STORAGE_KEY);
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = savedLang || (this.isSupported(browserLang) ? browserLang : 'en');

    this.translate.setDefaultLang('en');
    this.setLanguage(defaultLang!);
  }

  private isSupported(lang?: string): boolean {
    return !!lang && this.languages.some(l => l.code === lang);
  }

  getCurrentLanguage(): Language {
    const currentCode = this.translate.currentLang || 'en';
    return this.languages.find(l => l.code === currentCode) || this.languages[0];
  }

  setLanguage(langCode: string): void {
    const language = this.languages.find(l => l.code === langCode);
    if (!language) return;

    this.translate.use(langCode);
    localStorage.setItem(this.STORAGE_KEY, langCode);

    // Update document direction for RTL languages
    document.documentElement.lang = langCode;
    document.documentElement.dir = language.direction;

    // Add/remove RTL class for styling
    if (language.direction === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }

  getLanguages(): Language[] {
    return this.languages;
  }
}
