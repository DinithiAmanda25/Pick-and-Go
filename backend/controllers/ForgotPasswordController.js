const { Client } = require('../models/ClientModel');
const { Driver } = require('../models/DriverModel');
const { VehicleOwner } = require('../models/VehicleOwnerModel');
const { BusinessOwner } = require('../models/BusinessOwnerModel');
const { Admin } = require('../models/AdminModel');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const crypto = require('crypto');

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Helper function to find user by email across all models
const findUserByEmail = async (email) => {
    const models = [
        { model: Client, role: 'client' },
        { model: Driver, role: 'driver' },
        { model: VehicleOwner, role: 'vehicle_owner' },
        { model: BusinessOwner, role: 'business_owner' },
        { model: Admin, role: 'admin' }
    ];

    for (const { model, role } of models) {
        try {
            const user = await model.findOne({ email, isActive: true });
            if (user) {
                return { user, role, model };
            }
        } catch (error) {
            console.error(`Error searching in ${role} model:`, error);
        }
    }
    return null;
};

// Helper function to find user by phone number across all models
const findUserByPhone = async (phone) => {
    const models = [
        { model: Client, role: 'client' },
        { model: Driver, role: 'driver' },
        { model: VehicleOwner, role: 'vehicle_owner' },
        { model: BusinessOwner, role: 'business_owner' },
        { model: Admin, role: 'admin' }
    ];

    // Normalize phone number for search
    const normalizedPhone = phone.replace(/[^0-9]/g, '');
    
    for (const { model, role } of models) {
        try {
            // Search for phone in various formats
            const user = await model.findOne({
                $and: [
                    { isActive: true },
                    {
                        $or: [
                            { phone: phone },
                            { phone: normalizedPhone },
                            { phone: `0${normalizedPhone.substring(2)}` }, // Convert +94 to 0
                            { phone: `+94${normalizedPhone.substring(1)}` }, // Convert 0 to +94
                            { phone: new RegExp(normalizedPhone.replace(/^94/, '0'), 'i') }
                        ]
                    }
                ]
            });
            if (user) {
                return { user, role, model };
            }
        } catch (error) {
            console.error(`Error searching in ${role} model:`, error);
        }
    }
    return null;
};

// Generate 6-digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Send OTP for password reset
const sendPasswordResetOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Find user by email
        const userResult = await findUserByEmail(email);
        if (!userResult) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address'
            });
        }

        const { user, role } = userResult;

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store OTP temporarily
        const otpKey = `${email}_${Date.now()}`;
        otpStore.set(otpKey, {
            otp,
            email,
            userId: user._id,
            role,
            expiry: otpExpiry,
            verified: false,
            method: 'email'
        });

        // Send OTP email
        const emailResult = await emailService.sendPasswordResetOTP(email, otp, user.fullName || user.name);

        if (emailResult.success) {
            // Clean up expired OTPs
            const now = new Date();
            for (const [key, value] of otpStore.entries()) {
                if (value.expiry < now) {
                    otpStore.delete(key);
                }
            }

            res.status(200).json({
                success: true,
                message: 'OTP sent to your email address',
                data: {
                    email,
                    otpKey,
                    expiresIn: 10 // minutes
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
        }

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Send OTP via SMS for password reset
const sendPasswordResetOTPSMS = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Validate phone number format
        if (!smsService.validatePhoneNumber(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number'
            });
        }

        // Find user by phone number
        const userResult = await findUserByPhone(phone);
        if (!userResult) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this phone number'
            });
        }

        const { user, role } = userResult;

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store OTP temporarily
        const otpKey = `${phone}_${Date.now()}`;
        otpStore.set(otpKey, {
            otp,
            phone,
            userId: user._id,
            role,
            expiry: otpExpiry,
            verified: false,
            method: 'sms'
        });

        // Send OTP SMS
        console.log('Attempting to send SMS OTP to:', phone);
        console.log('Generated OTP:', otp);
        console.log('SMS Service available:', !!smsService);
        console.log('SMS Service sendOTPSMS method:', typeof smsService.sendOTPSMS);
        
        const smsResult = await smsService.sendOTPSMS(phone, otp, user.fullName || user.name);
        
        console.log('SMS Result:', smsResult);

        if (smsResult.success) {
            // Clean up expired OTPs
            const now = new Date();
            for (const [key, value] of otpStore.entries()) {
                if (value.expiry < now) {
                    otpStore.delete(key);
                }
            }

            res.status(200).json({
                success: true,
                message: 'OTP sent to your phone number',
                data: {
                    phone,
                    otpKey,
                    expiresIn: 10 // minutes
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: smsResult.message || 'Failed to send OTP. Please try again.'
            });
        }

    } catch (error) {
        console.error('Send SMS OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Verify OTP (for both email and SMS)
const verifyPasswordResetOTP = async (req, res) => {
    try {
        const { email, phone, otp, otpKey } = req.body;

        if ((!email && !phone) || !otp || !otpKey) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone, OTP, and OTP key are required'
            });
        }

        // Find OTP record
        const otpRecord = otpStore.get(otpKey);
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP session'
            });
        }

        // Check if OTP expired
        if (new Date() > otpRecord.expiry) {
            otpStore.delete(otpKey);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Verify OTP and contact method
        const isValidOTP = otpRecord.otp === otp;
        const isValidContact = (otpRecord.method === 'email' && otpRecord.email === email) ||
                              (otpRecord.method === 'sms' && otpRecord.phone === phone);
        
        if (!isValidOTP || !isValidContact) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP or contact information'
            });
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        otpStore.set(otpKey, otpRecord);

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                otpKey,
                verified: true
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { email, phone, newPassword, otpKey } = req.body;

        if ((!email && !phone) || !newPassword || !otpKey) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone, new password, and OTP key are required'
            });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Find OTP record
        const otpRecord = otpStore.get(otpKey);
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset session'
            });
        }

        // Check if OTP was verified
        if (!otpRecord.verified) {
            return res.status(400).json({
                success: false,
                message: 'OTP not verified. Please verify OTP first.'
            });
        }

        // Check if session expired
        if (new Date() > otpRecord.expiry) {
            otpStore.delete(otpKey);
            return res.status(400).json({
                success: false,
                message: 'Reset session has expired. Please start over.'
            });
        }

        // Find user and update password
        const userResult = otpRecord.method === 'email' 
            ? await findUserByEmail(email) 
            : await findUserByPhone(phone);
            
        if (!userResult) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { user, model } = userResult;

        // Update password (Note: In production, you should hash the password)
        await model.findByIdAndUpdate(user._id, {
            password: newPassword,
            updatedAt: new Date()
        });

        // Clean up OTP record
        otpStore.delete(otpKey);

        // Send confirmation based on method used
        if (otpRecord.method === 'email') {
            await emailService.sendPasswordResetConfirmation(email, user.fullName || user.name);
        } else if (otpRecord.method === 'sms') {
            await smsService.sendPasswordResetConfirmationSMS(phone, user.fullName || user.name);
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Resend OTP
const resendPasswordResetOTP = async (req, res) => {
    try {
        const { email, otpKey } = req.body;

        if (!email || !otpKey) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP key are required'
            });
        }

        // Find existing OTP record
        const existingOtpRecord = otpStore.get(otpKey);
        if (!existingOtpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP session. Please start over.'
            });
        }

        // Find user by email
        const userResult = await findUserByEmail(email);
        if (!userResult) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address'
            });
        }

        const { user } = userResult;

        // Generate new OTP
        const newOtp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Update OTP record
        existingOtpRecord.otp = newOtp;
        existingOtpRecord.expiry = otpExpiry;
        existingOtpRecord.verified = false;
        otpStore.set(otpKey, existingOtpRecord);

        // Send new OTP email
        const emailResult = await emailService.sendPasswordResetOTP(email, newOtp, user.fullName || user.name);

        if (emailResult.success) {
            res.status(200).json({
                success: true,
                message: 'New OTP sent to your email address',
                data: {
                    email,
                    otpKey,
                    expiresIn: 10 // minutes
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
        }

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Resend OTP via SMS
const resendPasswordResetOTPSMS = async (req, res) => {
    try {
        const { phone, otpKey } = req.body;

        if (!phone || !otpKey) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP key are required'
            });
        }

        // Find existing OTP record
        const otpRecord = otpStore.get(otpKey);
        if (!otpRecord || otpRecord.phone !== phone) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP session'
            });
        }

        // Check if we can resend (not too soon)
        const timeSinceCreated = Date.now() - parseInt(otpKey.split('_')[1]);
        if (timeSinceCreated < 60000) { // 1 minute cooldown
            return res.status(429).json({
                success: false,
                message: 'Please wait at least 1 minute before requesting a new OTP'
            });
        }

        // Find user by phone
        const userResult = await findUserByPhone(phone);
        if (!userResult) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this phone number'
            });
        }

        const { user } = userResult;

        // Generate new OTP
        const newOtp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Update existing record with new OTP
        otpRecord.otp = newOtp;
        otpRecord.expiry = otpExpiry;
        otpStore.set(otpKey, otpRecord);

        // Send new OTP SMS
        const smsResult = await smsService.sendOTPSMS(phone, newOtp, user.fullName || user.name);

        if (smsResult.success) {
            res.status(200).json({
                success: true,
                message: 'New OTP sent to your phone number',
                data: {
                    phone,
                    otpKey,
                    expiresIn: 10 // minutes
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: smsResult.message || 'Failed to send OTP. Please try again.'
            });
        }

    } catch (error) {
        console.error('Resend SMS OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Clean up expired OTPs (should be called periodically)
const cleanupExpiredOTPs = () => {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [key, value] of otpStore.entries()) {
        if (value.expiry < now) {
            otpStore.delete(key);
            cleanedCount++;
        }
    }
    
    if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired OTP records`);
    }
};

// Run cleanup every 15 minutes
setInterval(cleanupExpiredOTPs, 15 * 60 * 1000);

module.exports = {
    sendPasswordResetOTP,
    sendPasswordResetOTPSMS,
    verifyPasswordResetOTP,
    resetPassword,
    resendPasswordResetOTP,
    resendPasswordResetOTPSMS,
    cleanupExpiredOTPs
};
