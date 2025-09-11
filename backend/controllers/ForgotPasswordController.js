const { Client } = require('../models/ClientModel');
const { Driver } = require('../models/DriverModel');
const { VehicleOwner } = require('../models/VehicleOwnerModel');
const { BusinessOwner } = require('../models/BusinessOwnerModel');
const { Admin } = require('../models/AdminModel');
const emailService = require('../services/emailService');
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
            verified: false
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

// Verify OTP
const verifyPasswordResetOTP = async (req, res) => {
    try {
        const { email, otp, otpKey } = req.body;

        if (!email || !otp || !otpKey) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and OTP key are required'
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

        // Verify OTP
        if (otpRecord.otp !== otp || otpRecord.email !== email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
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
        const { email, newPassword, otpKey } = req.body;

        if (!email || !newPassword || !otpKey) {
            return res.status(400).json({
                success: false,
                message: 'Email, new password, and OTP key are required'
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
        const userResult = await findUserByEmail(email);
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

        // Send confirmation email
        await emailService.sendPasswordResetConfirmation(email, user.fullName || user.name);

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
    verifyPasswordResetOTP,
    resetPassword,
    resendPasswordResetOTP,
    cleanupExpiredOTPs
};
