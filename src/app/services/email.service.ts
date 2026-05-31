import { Injectable } from '@angular/core';

export interface BookingDetails {
  firstName: string;
  lastName: string;
  email: string;
  bookingOption: string;
  checkIn: string;
  checkOut: string;
}

export interface ContactDetails {
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly WEB3FORMS_ACCESS_KEY = '40d4aa47-e377-452b-be00-7f8741535d95';

  // Hardcoded owner's email address
  public readonly OWNER_EMAIL = 'grpkarunathilaka@gmail.com';

  constructor() { }

  /**
   * Send booking inquiry. Falls back to mailto if Web3Forms fails.
   */
  async sendBooking(details: BookingDetails): Promise<{ success: boolean; method: 'web3forms' | 'mailto'; error?: any }> {
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: this.WEB3FORMS_ACCESS_KEY,
          subject: 'New Booking Inquiry - Seth Villa Matara',
          from_name: `${details.firstName} ${details.lastName}`,
          name: `${details.firstName} ${details.lastName}`,
          email: details.email,
          booking_option: details.bookingOption,
          check_in: details.checkIn,
          check_out: details.checkOut,
          message: `Accommodation: ${details.bookingOption}\nCheck-in: ${details.checkIn}\nCheck-out: ${details.checkOut}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return { success: true, method: 'web3forms' };
      } else {
        throw new Error(data.message || 'Web3Forms booking submission failed');
      }
    } catch (err) {
      console.error('Web3Forms Booking failed, falling back to mailto:', err);
      this.triggerMailtoBooking(details);
      return { success: true, method: 'mailto', error: err };
    }
  }

  /**
   * Send contact message. Falls back to mailto if Web3Forms fails.
   */
  async sendContact(details: ContactDetails): Promise<{ success: boolean; method: 'web3forms' | 'mailto'; error?: any }> {
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: this.WEB3FORMS_ACCESS_KEY,
          subject: `Contact Inquiry from ${details.name} - Seth Villa Matara`,
          from_name: details.name,
          name: details.name,
          email: details.email,
          message: details.message
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return { success: true, method: 'web3forms' };
      } else {
        throw new Error(data.message || 'Web3Forms contact submission failed');
      }
    } catch (err) {
      console.error('Web3Forms Contact failed, falling back to mailto:', err);
      this.triggerMailtoContact(details);
      return { success: true, method: 'mailto', error: err };
    }
  }

  private triggerMailtoBooking(details: BookingDetails): void {
    const subject = encodeURIComponent(`Booking Inquiry: Seth Villa Matara`);
    const body = encodeURIComponent(
      `Hello Seth Villa Matara,\n\n` +
      `I would like to inquire about booking the villa. Here are my details:\n\n` +
      `- Name: ${details.firstName} ${details.lastName}\n` +
      `- Email: ${details.email}\n` +
      `- Accommodation: ${details.bookingOption}\n` +
      `- Check-In Date: ${details.checkIn}\n` +
      `- Check-Out Date: ${details.checkOut}\n\n` +
      `Please let me know availability and rates.\n\n` +
      `Best regards,\n` +
      `${details.firstName} ${details.lastName}`
    );
    window.location.href = `mailto:${this.OWNER_EMAIL}?subject=${subject}&body=${body}`;
  }

  private triggerMailtoContact(details: ContactDetails): void {
    const subject = encodeURIComponent(`Contact Inquiry from ${details.name}`);
    const body = encodeURIComponent(
      `Hello Seth Villa Matara,\n\n` +
      `You have received a new contact message:\n\n` +
      `- Name: ${details.name}\n` +
      `- Email: ${details.email}\n` +
      `- Message: ${details.message}\n\n` +
      `Best regards,\n` +
      `${details.name}`
    );
    window.location.href = `mailto:${this.OWNER_EMAIL}?subject=${subject}&body=${body}`;
  }
}
