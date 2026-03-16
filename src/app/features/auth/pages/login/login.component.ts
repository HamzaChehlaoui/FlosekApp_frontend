import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, LanguageService, GoogleAuthService } from '../../../../core/services';
import { LoginRequest } from '../../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly authService = inject(AuthService);
  private readonly googleAuthService = inject(GoogleAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  showPassword = false;
  errorMessage = '';
  isLoading = false;
  returnUrl = '/profile';
  readonly languages = this.languageService.getLanguages();

  constructor() { }

  get currentLanguageCode(): string {
    return this.languageService.getCurrentLanguage().code;
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.route.snapshot.queryParams['sessionExpired']) {
      this.errorMessage = 'Your session has expired. Please login again.';
    }

    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    this.googleAuthService.initializeGoogleSignIn((response) => this.handleGoogleCredential(response));
    
    // Slight delay to ensure the DOM element is ready before rendering
    setTimeout(() => {
      const googleBtnContainer = document.getElementById('google-btn-container');
      if (googleBtnContainer) {
        this.googleAuthService.renderButton(googleBtnContainer, { width: 320 });
      }
    }, 100);
  }

  private handleGoogleCredential(response: any): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.errorMessage = error.userMessage || 'Google Sign-In failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  setLanguage(langCode: string): void {
    this.languageService.setLanguage(langCode);
  }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.errorMessage = error.userMessage || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
