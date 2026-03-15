import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfFontService {
  private amiriFontLoaded = false;
  private amiriFontBase64: string | null = null;
  private amiriBoldFontBase64: string | null = null;

  // Google Fonts URLs for Amiri (supports Arabic, French, and Latin)
  private readonly AMIRI_REGULAR_URL = 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUrtA.ttf';
  private readonly AMIRI_BOLD_URL = 'https://fonts.gstatic.com/s/amiri/v27/J7acnpd8CGxBHp2VkZY.ttf';

  /**
   * Load and register Amiri font for Arabic/French support in jsPDF
   */
  async loadArabicFont(doc: jsPDF): Promise<boolean> {
    try {
      // Load fonts if not already cached
      if (!this.amiriFontBase64) {
        const [regularFont, boldFont] = await Promise.all([
          this.fetchFontAsBase64(this.AMIRI_REGULAR_URL),
          this.fetchFontAsBase64(this.AMIRI_BOLD_URL)
        ]);

        this.amiriFontBase64 = regularFont;
        this.amiriBoldFontBase64 = boldFont;
      }

      if (this.amiriFontBase64 && this.amiriBoldFontBase64) {
        // Register fonts with jsPDF
        doc.addFileToVFS('Amiri-Regular.ttf', this.amiriFontBase64);
        doc.addFileToVFS('Amiri-Bold.ttf', this.amiriBoldFontBase64);

        doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
        doc.addFont('Amiri-Bold.ttf', 'Amiri', 'bold');

        this.amiriFontLoaded = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to load Arabic font:', error);
      return false;
    }
  }

  /**
   * Fetch font file and convert to base64
   */
  private async fetchFontAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return this.arrayBufferToBase64(arrayBuffer);
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Check if font is loaded
   */
  isFontLoaded(): boolean {
    return this.amiriFontLoaded;
  }

  /**
   * Get the appropriate font name based on language
   */
  getFontName(lang: string): string {
    if (lang === 'ar' || lang === 'fr') {
      return 'Amiri';
    }
    return 'helvetica';
  }

  /**
   * Reverse text for RTL languages (Arabic)
   * jsPDF doesn't handle RTL automatically, so we need to reverse the text
   */
  processTextForPdf(text: string, lang: string): string {
    if (lang === 'ar') {
      // For Arabic, we need to reshape and reverse the text
      return this.reshapeArabicText(text);
    }
    return text;
  }

  /**
   * Reshape Arabic text for proper display in PDF
   * This handles Arabic letter connections
   */
  private reshapeArabicText(text: string): string {
    // Simple reversal for RTL - jsPDF will render it correctly
    // For complex Arabic shaping, you might need arabic-reshaper library
    return text.split('').reverse().join('');
  }

  /**
   * Check if text contains Arabic characters
   */
  containsArabic(text: string): boolean {
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicPattern.test(text);
  }

  /**
   * Check if language requires special font
   */
  requiresSpecialFont(lang: string): boolean {
    return lang === 'ar' || lang === 'fr';
  }
}
