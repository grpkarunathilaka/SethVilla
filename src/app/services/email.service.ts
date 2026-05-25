import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

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
  // Developer should replace these placeholders with real EmailJS Credentials
  private readonly SERVICE_ID = 'service_placeholder';
  private readonly TEMPLATE_ID_BOOKING = 'template_booking_placeholder';
  private readonly TEMPLATE_ID_CONTACT = 'template_contact_placeholder';
  private readonly PUBLIC_KEY = 'public_key_placeholder';

  // Hardcoded owner's email address
  public readonly OWNER_EMAIL = 'grpkarunathilaka@gmail.com';

  constructor() { }

  /**
   * Helper to check if credentials are still placeholder values.
   */
  private hasRealCredentials(): boolean {
    return (
      this.SERVICE_ID !== 'service_placeholder' &&
      this.PUBLIC_KEY !== 'public_key_placeholder'
    );
  }

  /**
   * Send booking inquiry. Falls back to mailto if EmailJS is not configured.
   */
  async sendBooking(details: BookingDetails): Promise<{ success: boolean; method: 'emailjs' | 'mailto'; error?: any }> {
    if (this.hasRealCredentials()) {
      try {
        const response = await emailjs.send(
          this.SERVICE_ID,
          this.TEMPLATE_ID_BOOKING,
          {
            owner_email: this.OWNER_EMAIL,
            client_name: `${details.firstName} ${details.lastName}`,
            client_email: details.email,
            booking_option: details.bookingOption,
            check_in: details.checkIn,
            check_out: details.checkOut,
            notes: `Requested dates: ${details.checkIn} to ${details.checkOut}. Suite choice: ${details.bookingOption}.`
          },
          this.PUBLIC_KEY
        );
        return { success: response.status === 200, method: 'emailjs' };
      } catch (err) {
        console.error('EmailJS Booking failed, falling back to mailto:', err);
        this.triggerMailtoBooking(details);
        return { success: true, method: 'mailto', error: err };
      }
    } else {
      // Fallback directly to mailto
      this.triggerMailtoBooking(details);
      return { success: true, method: 'mailto' };
    }
  }

  /**
   * Send contact message. Falls back to mailto if EmailJS is not configured.
   */
  async sendContact(details: ContactDetails): Promise<{ success: boolean; method: 'emailjs' | 'mailto'; error?: any }> {
    if (this.hasRealCredentials()) {
      try {
        const response = await emailjs.send(
          this.SERVICE_ID,
          this.TEMPLATE_ID_CONTACT,
          {
            owner_email: this.OWNER_EMAIL,
            from_name: details.name,
            from_email: details.email,
            message: details.message
          },
          this.PUBLIC_KEY
        );
        return { success: response.status === 200, method: 'emailjs' };
      } catch (err) {
        console.error('EmailJS Contact failed, falling back to mailto:', err);
        this.triggerMailtoContact(details);
        return { success: true, method: 'mailto', error: err };
      }
    } else {
      // Fallback directly to mailto
      this.triggerMailtoContact(details);
      return { success: true, method: 'mailto' };
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
