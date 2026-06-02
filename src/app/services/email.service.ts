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
   * Send booking inquiry. Initiates Web3Forms background submit and returns immediately.
   */
  async sendBooking(details: BookingDetails): Promise<{ success: boolean; method: 'web3forms' | 'mailto'; error?: any }> {
    // Fire-and-forget fetch request in the background
    fetch('https://api.web3forms.com/submit', {
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
    }).catch(err => {
      console.error('Background Web3Forms Booking failed:', err);
    });

    // Return success immediately to update the UI without waiting
    return { success: true, method: 'web3forms' };
  }

  /**
   * Send contact message. Initiates Web3Forms background submit and returns immediately.
   */
  async sendContact(details: ContactDetails): Promise<{ success: boolean; method: 'web3forms' | 'mailto'; error?: any }> {
    // Fire-and-forget fetch request in the background
    fetch('https://api.web3forms.com/submit', {
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
    }).catch(err => {
      console.error('Background Web3Forms Contact failed:', err);
    });

    // Return success immediately to update the UI without waiting
    return { success: true, method: 'web3forms' };
  }

  private triggerMailtoBooking(details: BookingDetails): void {
    if (typeof window === 'undefined') return;
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
    if (typeof window === 'undefined') return;
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
