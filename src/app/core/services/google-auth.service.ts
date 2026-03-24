import { Injectable } from '@angular/core';
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

  /**
   * Waits for the Google Identity Services script to load.
   * Polls every 200ms for up to 10 seconds.
   */
  private waitForGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google?.accounts) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; // 50 * 200ms = 10 seconds
      const interval = setInterval(() => {
        attempts++;
        if (typeof window !== 'undefined' && window.google?.accounts) {
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Google Identity Services script failed to load after 10 seconds'));
        }
      }, 200);
    });
  }

  async initializeGoogleSignIn(callback: (response: any) => void): Promise<void> {
    try {
      await this.waitForGoogleScript();
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: callback,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    } catch (error) {
      console.error('Google Identity Services script not loaded:', error);
    }
  }

  async renderButton(element: HTMLElement, options?: any): Promise<void> {
    try {
      await this.waitForGoogleScript();
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
    } catch (error) {
      console.error('Could not render Google button:', error);
    }
  }
}
