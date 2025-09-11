// Forgot Password API Service
class ForgotPasswordService {
    constructor() {
        this.baseURL = 'http://localhost:3001/api/auth/forgot-password';
    }

    // Send OTP for password reset
    async sendOTP(email) {
        try {
            const response = await fetch(`${this.baseURL}/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            return {
                success: true,
                data: data.data,
                message: data.message
            };

        } catch (error) {
            console.error('Send OTP error:', error);
            return {
                success: false,
                message: error.message || 'Failed to send OTP. Please try again.'
            };
        }
    }

    // Verify OTP
    async verifyOTP(email, otp, otpKey) {
        try {
            const response = await fetch(`${this.baseURL}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, otpKey })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify OTP');
            }

            return {
                success: true,
                data: data.data,
                message: data.message
            };

        } catch (error) {
            console.error('Verify OTP error:', error);
            return {
                success: false,
                message: error.message || 'Failed to verify OTP. Please try again.'
            };
        }
    }

    // Reset password
    async resetPassword(email, newPassword, otpKey) {
        try {
            const response = await fetch(`${this.baseURL}/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, newPassword, otpKey })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            return {
                success: true,
                message: data.message
            };

        } catch (error) {
            console.error('Reset password error:', error);
            return {
                success: false,
                message: error.message || 'Failed to reset password. Please try again.'
            };
        }
    }

    // Resend OTP
    async resendOTP(email, otpKey) {
        try {
            const response = await fetch(`${this.baseURL}/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otpKey })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            return {
                success: true,
                data: data.data,
                message: data.message
            };

        } catch (error) {
            console.error('Resend OTP error:', error);
            return {
                success: false,
                message: error.message || 'Failed to resend OTP. Please try again.'
            };
        }
    }

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength
    validatePassword(password) {
        const errors = [];

        if (!password) {
            errors.push('Password is required');
        } else {
            if (password.length < 8) {
                errors.push('Password must be at least 8 characters long');
            }
            if (!/[A-Z]/.test(password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            if (!/[a-z]/.test(password)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            if (!/\d/.test(password)) {
                errors.push('Password must contain at least one number');
            }
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                errors.push('Password must contain at least one special character');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Get password strength score (0-4)
    getPasswordStrength(password) {
        let score = 0;
        
        if (!password) return { score: 0, text: 'Very Weak', color: 'red' };
        
        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Character variety checks
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
        
        // Determine strength
        if (score < 2) return { score, text: 'Very Weak', color: 'red' };
        if (score < 3) return { score, text: 'Weak', color: 'orange' };
        if (score < 4) return { score, text: 'Fair', color: 'yellow' };
        if (score < 5) return { score, text: 'Good', color: 'lightgreen' };
        return { score, text: 'Strong', color: 'green' };
    }
}

// Create and export a singleton instance
const forgotPasswordService = new ForgotPasswordService();
export default forgotPasswordService;
