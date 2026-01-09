import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly username: string;
  private readonly senderId: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    // Africa's Talking configuration (default)
    this.apiKey = this.configService.get<string>('AFRICASTALKING_API_KEY') || '';
    this.username = this.configService.get<string>('AFRICASTALKING_USERNAME') || '';
    this.senderId = this.configService.get<string>('SMS_SENDER_ID') || 'RRSchool';
    this.enabled = this.configService.get<string>('SMS_ENABLED') !== 'false';

    if (!this.enabled) {
      this.logger.warn('SMS service is disabled. Set SMS_ENABLED=true to enable.');
    }
  }

  /**
   * Send SMS using Africa's Talking API
   */
  async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug(`SMS disabled - would send to ${to}: ${message.substring(0, 50)}...`);
      return false;
    }

    if (!this.apiKey || !this.username) {
      this.logger.error('SMS configuration missing: AFRICASTALKING_API_KEY and AFRICASTALKING_USERNAME are required');
      throw new Error('SMS service not configured. Please set AFRICASTALKING_API_KEY and AFRICASTALKING_USERNAME environment variables.');
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = this.formatPhoneNumber(to);

    try {
      const response = await axios.post(
        'https://api.africastalking.com/version1/messaging',
        new URLSearchParams({
          username: this.username,
          to: formattedPhone,
          message: message,
          from: this.senderId,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (response.data && response.data.SMSMessageData) {
        this.logger.log(`SMS sent successfully to ${formattedPhone}`);
        return true;
      } else {
        this.logger.error(`Unexpected SMS API response: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error: any) {
      this.logger.error(`Failed to send SMS to ${formattedPhone}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Format phone number to international format
   * Accepts formats like: 254712345678, +254712345678, 0712345678
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all spaces, dashes, and parentheses
    let cleaned = phone.replace(/[\s\-()]/g, '');

    // If it already starts with +, return as is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    // If it starts with 0 (local format), replace with country code
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }

    // If it doesn't start with country code, assume it's missing
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }

    return '+' + cleaned;
  }

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBulkSms(recipients: string[], message: string): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await this.sendSms(recipient, message);
        success++;
      } catch (error) {
        this.logger.error(`Failed to send SMS to ${recipient}`);
        failed++;
      }
    }

    return { success, failed };
  }
}
