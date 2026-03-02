import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, LanguageService, Language } from '../../services';
import { User } from '../../models';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    user: User | null = null;
    isMobileMenuOpen = false;
    isLangDropdownOpen = false;

    private readonly languageService = inject(LanguageService);

    constructor(private authService: AuthService, private router: Router) {
        // Subscribe to currentUser changes so the header updates automatically on login/logout
        this.authService.currentUser$.subscribe(user => {
            this.user = user;
        });
    }

    get currentLanguage(): Language {
        return this.languageService.getCurrentLanguage();
    }

    get languages(): Language[] {
        return this.languageService.getLanguages();
    }

    toggleLangDropdown(): void {
        this.isLangDropdownOpen = !this.isLangDropdownOpen;
    }

    closeLangDropdown(): void {
        this.isLangDropdownOpen = false;
    }

    switchLanguage(langCode: string): void {
        this.languageService.setLanguage(langCode);
        this.closeLangDropdown();
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
