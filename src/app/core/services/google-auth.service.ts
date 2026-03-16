import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private readonly clientId = environment.googleClientId;

  initializeGoogleSignIn(callback: (response: any) => void): void {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: callback,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    } else {
      console.error('Google Identity Services script not loaded');
    }
  }

  renderButton(element: HTMLElement, options?: any): void {
    if (typeof window !== 'undefined' && window.google) {
      const defaultOptions = {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: 300
      };
      window.google.accounts.id.renderButton(element, { ...defaultOptions, ...options });
    }
  }
}
