import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { EmailService, BookingDetails, ContactDetails } from './services/email.service';
import { AnalyticsService } from './services/analytics.service';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isStart: boolean;
  isEnd: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('seth-villa');

  // Hardcoded WhatsApp number (e.g. +1 555 123-4567, without spaces/plus for URL)
  public readonly WHATSAPP_NUMBER = '15551234567';
  public readonly WHATSAPP_URL = `https://wa.me/${this.WHATSAPP_NUMBER}?text=Hello!%20I%20would%20like%20to%20inquire%20about%20booking%20Serenity%20Found%20villa.`;

  // Booking Form State
  bookingForm = {
    firstName: '',
    lastName: '',
    email: '',
    bookingOption: 'Master Suite', // Default
  };

  // Contact Form State
  contactForm = {
    name: '',
    email: '',
    message: '',
  };

  // Calendar State
  currentDate = new Date();
  calendarMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  calendarDays: CalendarDay[] = [];

  // Feedback Notifications
  bookingStatus: { type: 'success' | 'error' | 'info' | null; message: string } = { type: null, message: '' };
  contactStatus: { type: 'success' | 'error' | 'info' | null; message: string } = { type: null, message: '' };

  // Mobile Menu State
  isMobileMenuOpen = false;

  constructor(
    private emailService: EmailService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.generateCalendar();
    this.analyticsService.trackPageView('Home', '/');
  }

  // Mobile Navigation toggle
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  // Smooth scroll helper
  scrollToSection(sectionId: string) {
    this.closeMobileMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.analyticsService.trackEvent('navigation_click', { section: sectionId });
    }
  }

  // Calendar Logic
  get monthYearLabel(): string {
    return this.calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  prevMonth() {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1);
    this.generateCalendar();
    this.analyticsService.trackEvent('calendar_prev_month', { month: this.monthYearLabel });
  }

  nextMonth() {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1);
    this.generateCalendar();
    this.analyticsService.trackEvent('calendar_next_month', { month: this.monthYearLabel });
  }

  generateCalendar() {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    
    // First day of current month
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    // Last day of current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Last day of previous month
    const prevTotalDays = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prev month days to fill start of week
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevTotalDays - i);
      days.push(this.createCalendarDay(date, false, today));
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push(this.createCalendarDay(date, true, today));
    }

    // Next month days to fill end of calendar (typically 42 items in total grid)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push(this.createCalendarDay(date, false, today));
    }

    this.calendarDays = days;
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const dateMs = date.getTime();
    const isPast = dateMs < today.getTime();
    
    const isStart = !!this.checkInDate && this.isSameDay(date, this.checkInDate);
    const isEnd = !!this.checkOutDate && this.isSameDay(date, this.checkOutDate);
    
    let isInRange = false;
    if (this.checkInDate && this.checkOutDate) {
      isInRange = dateMs > this.checkInDate.getTime() && dateMs < this.checkOutDate.getTime();
    }

    return {
      date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday: this.isSameDay(date, today),
      isSelected: isStart || isEnd,
      isInRange,
      isStart,
      isEnd,
      isPast
    };
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  selectDate(day: CalendarDay) {
    if (day.isPast) return; // Cannot select past dates

    const clickedDate = day.date;

    if (!this.checkInDate || (this.checkInDate && this.checkOutDate)) {
      // First click or resetting
      this.checkInDate = clickedDate;
      this.checkOutDate = null;
      this.analyticsService.trackEvent('calendar_select_checkin', { date: clickedDate.toDateString() });
    } else if (this.checkInDate && !this.checkOutDate) {
      // Second click
      if (clickedDate.getTime() < this.checkInDate.getTime()) {
        // If clicked date is before check-in, make it the check-in date
        this.checkInDate = clickedDate;
        this.analyticsService.trackEvent('calendar_select_checkin', { date: clickedDate.toDateString() });
      } else {
        // Set check-out
        this.checkOutDate = clickedDate;
        this.analyticsService.trackEvent('calendar_select_checkout', { date: clickedDate.toDateString() });
      }
    }

    this.generateCalendar();
  }

  // Format date helper for inputs
  getFormattedDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  // Triggered on Form Submission
  async onConfirmBooking() {
    if (!this.bookingForm.firstName || !this.bookingForm.lastName || !this.bookingForm.email) {
      this.bookingStatus = {
        type: 'error',
        message: 'Please fill in all personal details.'
      };
      return;
    }

    if (!this.checkInDate || !this.checkOutDate) {
      this.bookingStatus = {
        type: 'error',
        message: 'Please select check-in and check-out dates on the calendar.'
      };
      return;
    }

    const bookingDetails: BookingDetails = {
      firstName: this.bookingForm.firstName,
      lastName: this.bookingForm.lastName,
      email: this.bookingForm.email,
      bookingOption: this.bookingForm.bookingOption,
      checkIn: this.getFormattedDate(this.checkInDate),
      checkOut: this.getFormattedDate(this.checkOutDate)
    };

    this.bookingStatus = { type: 'info', message: 'Processing your request...' };

    this.analyticsService.trackEvent('booking_submit_attempt', {
      option: bookingDetails.bookingOption,
      duration: `${bookingDetails.checkIn} - ${bookingDetails.checkOut}`
    });

    const result = await this.emailService.sendBooking(bookingDetails);

    if (result.success) {
      this.analyticsService.trackEvent('booking_submit_success', { method: result.method });
      if (result.method === 'emailjs') {
        this.bookingStatus = {
          type: 'success',
          message: 'Booking request sent successfully via EmailJS! We will contact you soon.'
        };
      } else {
        this.bookingStatus = {
          type: 'success',
          message: 'Email client opened with pre-filled booking details. Please send the draft!'
        };
      }
      
      // Reset forms
      this.bookingForm = { firstName: '', lastName: '', email: '', bookingOption: 'Master Suite' };
      this.checkInDate = null;
      this.checkOutDate = null;
      this.generateCalendar();
    } else {
      this.bookingStatus = {
        type: 'error',
        message: 'Failed to process booking request. Please try contacting us directly.'
      };
    }
  }

  // Contact Message submission
  async onSendMessage() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.contactStatus = {
        type: 'error',
        message: 'Please fill in all message details.'
      };
      return;
    }

    const contactDetails: ContactDetails = {
      name: this.contactForm.name,
      email: this.contactForm.email,
      message: this.contactForm.message
    };

    this.contactStatus = { type: 'info', message: 'Sending message...' };
    
    this.analyticsService.trackEvent('contact_submit_attempt', { name: contactDetails.name });

    const result = await this.emailService.sendContact(contactDetails);

    if (result.success) {
      this.analyticsService.trackEvent('contact_submit_success', { method: result.method });
      if (result.method === 'emailjs') {
        this.contactStatus = {
          type: 'success',
          message: 'Message sent successfully via EmailJS! We will respond shortly.'
        };
      } else {
        this.contactStatus = {
          type: 'success',
          message: 'Email client opened with message draft. Please send the draft!'
        };
      }
      this.contactForm = { name: '', email: '', message: '' };
    } else {
      this.contactStatus = {
        type: 'error',
        message: 'Failed to send message. Please try emailing directly.'
      };
    }
  }

  // WhatsApp click tracking
  onWhatsAppClick() {
    this.analyticsService.trackEvent('whatsapp_connect_click', { number: this.WHATSAPP_NUMBER });
  }

  // Social click tracking
  onSocialClick(platform: string) {
    this.analyticsService.trackEvent('social_media_click', { platform });
  }
}
