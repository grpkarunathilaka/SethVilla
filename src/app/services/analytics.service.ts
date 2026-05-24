import { Injectable } from '@angular/core';

declare const gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly MEASUREMENT_ID = 'G-XXXXXXXXXX';

  constructor() {}

  /**
   * Tracks custom event (e.g. Booking confirmation, WhatsApp connection click)
   */
  trackEvent(eventName: string, eventParams: Record<string, any> = {}): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        ...eventParams,
        send_to: this.MEASUREMENT_ID,
      });
      console.log(`[Google Analytics] Event tracked: ${eventName}`, eventParams);
    } else {
      console.log(`[Google Analytics (Mock)]: Event: ${eventName}`, eventParams);
    }
  }

  /**
   * Tracks page view
   */
  trackPageView(pageTitle: string, pagePath: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('config', this.MEASUREMENT_ID, {
        page_title: pageTitle,
        page_path: pagePath,
      });
      console.log(`[Google Analytics] Page view tracked: ${pagePath} (${pageTitle})`);
    } else {
      console.log(`[Google Analytics (Mock)]: Page View: ${pagePath} (${pageTitle})`);
    }
  }
}
