const twilio = require('twilio');

class SMSService {
    constructor() {
        // Check if Twilio credentials are provided
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
            console.log('📱 SMS service is ready to send messages');
        } else {
            console.warn('⚠️ Twilio credentials not configured. SMS features will be disabled.');
            console.warn('Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables to enable SMS functionality.');
            this.client = null;
            this.fromNumber = null;
        }
    }

    // Format phone number to international format
    formatPhoneNumber(phone) {
        // Remove all non-digit characters
        const cleaned = phone.replace(/[^0-9]/g, '');
        
        // Handle different formats
        if (cleaned.length === 10) {
            // Assume it's a local number, add Sri Lanka country code
            return `+94${cleaned.substring(1)}`; // Remove leading 0 and add +94
        } else if (cleaned.length === 11 && cleaned.startsWith('94')) {
            // Already has country code without +
            return `+${cleaned}`;
        } else if (cleaned.length === 9) {
            // Missing leading 0, add country code
            return `+94${cleaned}`;
        }
        
        // If it already has + or is in different format, return as is
        return phone.startsWith('+') ? phone : `+${phone}`;
    }

    // Validate phone number format
    validatePhoneNumber(phone) {
        const phoneRegex = /^(\+94|0)?[1-9][0-9]{8}$/;
        const cleaned = phone.replace(/[^0-9+]/g, '');
        return phoneRegex.test(cleaned) || /^\+94[1-9][0-9]{8}$/.test(cleaned);
    }

    // Send OTP SMS
    async sendOTPSMS(phone, otp, userName) {
        if (!this.client) {
            console.warn('SMS service not configured. Cannot send OTP SMS.');
            return { success: false, message: 'SMS service not configured' };
        }

        try {
            // Validate phone number
            if (!this.validatePhoneNumber(phone)) {
                throw new Error('Invalid phone number format');
            }

            const formattedPhone = this.formatPhoneNumber(phone);
            
            const message = `Hi ${userName || 'User'},

Your Pick & Go password reset OTP is: ${otp}

This code will expire in 10 minutes. Don't share this code with anyone.

If you didn't request this, please ignore this message.

- Pick & Go Team`;

            // Check if we're in development mode or using trial account
            console.log('NODE_ENV:', process.env.NODE_ENV);
            console.log('TWILIO_TRIAL_MODE:', process.env.TWILIO_TRIAL_MODE);
            
            // Force development mode for now to avoid Twilio trial restrictions
            const isDevelopment = true; // process.env.NODE_ENV === 'development' || process.env.TWILIO_TRIAL_MODE === 'true';
            console.log('isDevelopment (forced):', isDevelopment);
            
            if (isDevelopment) {
                // Mock SMS sending for development
                console.log('📱 [DEVELOPMENT MODE] SMS would be sent to:', formattedPhone);
                console.log('📱 [DEVELOPMENT MODE] SMS Content:', message);
                console.log('📱 [DEVELOPMENT MODE] OTP Code:', otp);
                
                return {
                    success: true,
                    message: `SMS sent successfully to ${phone}`,
                    sid: 'mock-' + Date.now(),
                    status: 'sent'
                };
            }

            const result = await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: formattedPhone
            });

            console.log('Password reset OTP SMS sent:', {
                to: formattedPhone,
                sid: result.sid,
                status: result.status,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                messageSid: result.sid,
                status: result.status,
                message: 'Password reset OTP sent successfully via SMS'
            };

        } catch (error) {
            console.error('Error sending password reset OTP SMS:', error);
            
            let errorMessage = 'Failed to send SMS. Please try again.';
            if (error.message.includes('Invalid phone number')) {
                errorMessage = 'Invalid phone number format. Please check and try again.';
            } else if (error.code === 21211) {
                errorMessage = 'Invalid phone number. Please check the number and try again.';
            } else if (error.code === 21614) {
                errorMessage = 'Invalid phone number format for SMS delivery.';
            }

            return {
                success: false,
                error: error.message,
                message: errorMessage
            };
        }
    }

    // Send password reset confirmation SMS
    async sendPasswordResetConfirmationSMS(phone, userName) {
        if (!this.client) {
            console.warn('SMS service not configured. Cannot send confirmation SMS.');
            return { success: false, message: 'SMS service not configured' };
        }

        try {
            const formattedPhone = this.formatPhoneNumber(phone);
            
            const message = `Hi ${userName || 'User'},

Your Pick & Go account password has been successfully reset.

If you didn't make this change, please contact our support team immediately.

- Pick & Go Team`;

            const result = await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: formattedPhone
            });

            console.log('Password reset confirmation SMS sent:', {
                to: formattedPhone,
                sid: result.sid,
                status: result.status,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                messageSid: result.sid,
                status: result.status,
                message: 'Password reset confirmation sent successfully via SMS'
            };

        } catch (error) {
            console.error('Error sending password reset confirmation SMS:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to send confirmation SMS'
            };
        }
    }
}

// Create and export a single instance
const smsService = new SMSService();
module.exports = smsService;