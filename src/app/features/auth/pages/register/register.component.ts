import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, LanguageService, GoogleAuthService } from '../../../../core/services';
import { RegisterRequest } from '../../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly authService = inject(AuthService);
  private readonly googleAuthService = inject(GoogleAuthService);
  private readonly router = inject(Router);

  userData: RegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  readonly languages = this.languageService.getLanguages();

  constructor() { }

  ngOnInit(): void {
    this.initializeGoogleSignIn();
  }

  @ViewChild('googleBtnContainer', { static: false }) googleBtnContainer!: import('@angular/core').ElementRef;

  private async initializeGoogleSignIn(): Promise<void> {
    await this.googleAuthService.initializeGoogleSignIn((response) => this.handleGoogleCredential(response));

    setTimeout(async () => {
      if (this.googleBtnContainer?.nativeElement) {
        const windowWidth = window.innerWidth;
        const buttonWidth = windowWidth < 400 ? Math.max(200, windowWidth - 60) : 320;
        await this.googleAuthService.renderButton(this.googleBtnContainer.nativeElement, { width: buttonWidth });
      }
    }, 50);
  }

  private handleGoogleCredential(response: any): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']); // Redirect to home on successful Google auth
      },
      error: (error) => {
        this.errorMessage = error.userMessage || 'Google Sign-In failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  get currentLanguageCode(): string {
    return this.languageService.getCurrentLanguage().code;
  }

  setLanguage(langCode: string): void {
    this.languageService.setLanguage(langCode);
  }

  get passwordStrength(): { level: number; text: string; color: string } {
    const password = this.userData.password;
    if (!password) return { level: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, text: 'Weak', color: '#ef4444' };
    if (score <= 3) return { level: 2, text: 'Medium', color: '#f59e0b' };
    if (score <= 4) return { level: 3, text: 'Strong', color: '#10b981' };
    return { level: 4, text: 'Very Strong', color: '#059669' };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    // Validation
    if (!this.userData.firstName || !this.userData.lastName) {
      this.errorMessage = 'Please enter your full name';
      return;
    }
    if (!this.userData.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }
    if (!this.userData.password) {
      this.errorMessage = 'Please enter a password';
      return;
    }
    if (this.userData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (this.userData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.successMessage = 'Account created successfully! Redirecting...';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.userMessage || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
