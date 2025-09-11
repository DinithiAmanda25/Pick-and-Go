const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Check if email credentials are provided
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            // Configure email transporter
            this.transporter = nodemailer.createTransport({
                service: 'gmail', // You can change this to your preferred email service
                auth: {
                    user: process.env.EMAIL_USER, // Your email
                    pass: process.env.EMAIL_PASSWORD // Your email app password
                }
            });

            // Verify transporter configuration
            this.transporter.verify((error, success) => {
                if (error) {
                    console.error('Email transporter configuration error:', error);
                } else {
                    console.log('📧 Email service is ready to send emails');
                }
            });
        } else {
            console.warn('⚠️ Email credentials not configured. Email features will be disabled.');
            console.warn('Please set EMAIL_USER and EMAIL_PASSWORD environment variables to enable email functionality.');
            this.transporter = null;
        }
    }

    // Send driver approval email
    async sendDriverApprovalEmail(driverData, credentials = null) {
        if (!this.transporter) {
            console.warn('Email service not configured. Cannot send driver approval email.');
            return { success: false, message: 'Email service not configured' };
        }

        try {
            const { fullName, email, status } = driverData;

            let subject, htmlContent;

            if (status === 'approved') {
                subject = '🎉 Your Driver Application has been Approved - Pick & Go';
                htmlContent = this.generateApprovalEmailHTML(fullName, credentials);
            } else if (status === 'rejected') {
                subject = '❌ Driver Application Status Update - Pick & Go';
                htmlContent = this.generateRejectionEmailHTML(fullName);
            } else {
                throw new Error('Invalid status for driver approval email');
            }

            const mailOptions = {
                from: {
                    name: 'Pick & Go',
                    address: process.env.EMAIL_USER
                },
                to: email,
                subject: subject,
                html: htmlContent
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log('Email sent successfully:', {
                messageId: info.messageId,
                recipient: email,
                status: status
            });

            return {
                success: true,
                messageId: info.messageId,
                message: 'Email sent successfully'
            };

        } catch (error) {
            console.error('Error sending driver approval email:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    // Send business owner notification about new driver application
    async sendNewApplicationNotification(businessOwnerEmail, driverData) {
        if (!this.transporter) {
            console.warn('Email service not configured. Cannot send new application notification.');
            return { success: false, message: 'Email service not configured' };
        }

        try {
            const { fullName, email, vehicleInfo } = driverData;

            const subject = '🚗 New Driver Application Received - Pick & Go';
            const htmlContent = this.generateNewApplicationNotificationHTML(fullName, email, vehicleInfo);

            const mailOptions = {
                from: {
                    name: 'Pick & Go',
                    address: process.env.EMAIL_USER
                },
                to: businessOwnerEmail,
                subject: subject,
                html: htmlContent
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log('New application notification sent:', {
                messageId: info.messageId,
                recipient: businessOwnerEmail
            });

            return {
                success: true,
                messageId: info.messageId,
                message: 'Notification sent successfully'
            };

        } catch (error) {
            console.error('Error sending new application notification:', error);
            throw new Error(`Failed to send notification: ${error.message}`);
        }
    }

    // Generate approval email HTML
    generateApprovalEmailHTML(driverName, credentials) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Driver Application Approved</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .credentials-box { background: white; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Congratulations!</h1>
                    <h2>Your Driver Application has been Approved</h2>
                </div>
                <div class="content">
                    <p>Dear <strong>${driverName}</strong>,</p>
                    
                    <p>We are excited to inform you that your driver application with <strong>Pick & Go</strong> has been approved! Welcome to our team of professional drivers.</p>
                    
                    ${credentials ? `
                    <div class="credentials-box">
                        <h3>🔐 Your Login Credentials</h3>
                        <p><strong>Email:</strong> ${credentials.email}</p>
                        <p><strong>Temporary Password:</strong> <code>${credentials.password}</code></p>
                        <p style="color: #dc3545; font-weight: bold;">⚠️ Please change your password after your first login for security.</p>
                    </div>
                    ` : ''}
                    
                    <h3>📋 Next Steps:</h3>
                    <ul>
                        <li>Log in to your driver dashboard using the credentials above</li>
                        <li>Complete your profile setup</li>
                        <li>Upload any remaining required documents</li>
                        <li>Review our driver guidelines and policies</li>
                        <li>Start accepting delivery requests</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/driver/login" class="button">Login to Dashboard</a>
                    </div>
                    
                    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    
                    <p>We look forward to working with you!</p>
                    
                    <p>Best regards,<br>
                    <strong>The Pick & Go Team</strong></p>
                </div>
                <div class="footer">
                    <p>© 2025 Pick & Go. All rights reserved.</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Generate rejection email HTML
    generateRejectionEmailHTML(driverName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Driver Application Update</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 Application Status Update</h1>
                </div>
                <div class="content">
                    <p>Dear <strong>${driverName}</strong>,</p>
                    
                    <p>Thank you for your interest in joining <strong>Pick & Go</strong> as a driver.</p>
                    
                    <p>After careful review of your application, we regret to inform you that we are unable to approve your driver application at this time.</p>
                    
                    <h3>📝 Possible Reasons:</h3>
                    <ul>
                        <li>Incomplete or missing required documents</li>
                        <li>Vehicle requirements not met</li>
                        <li>Background verification issues</li>
                        <li>Current driver capacity is full</li>
                    </ul>
                    
                    <p>We encourage you to reapply in the future if your circumstances change or if you can address any deficiencies in your application.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/driver/apply" class="button">Reapply</a>
                    </div>
                    
                    <p>If you have questions about this decision or need clarification, please contact our support team.</p>
                    
                    <p>Thank you for your understanding.</p>
                    
                    <p>Best regards,<br>
                    <strong>The Pick & Go Team</strong></p>
                </div>
                <div class="footer">
                    <p>© 2025 Pick & Go. All rights reserved.</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Generate new application notification HTML
    generateNewApplicationNotificationHTML(driverName, driverEmail, vehicleInfo) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Driver Application</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%); color: #212529; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; border-left: 4px solid #007bff; padding: 15px; margin: 15px 0; }
                .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚗 New Driver Application</h1>
                </div>
                <div class="content">
                    <p>Hello Business Owner,</p>
                    
                    <p>A new driver application has been submitted and is awaiting your review.</p>
                    
                    <div class="info-box">
                        <h3>📋 Application Details:</h3>
                        <p><strong>Driver Name:</strong> ${driverName}</p>
                        <p><strong>Email:</strong> ${driverEmail}</p>
                        ${vehicleInfo ? `
                        <p><strong>Vehicle Type:</strong> ${vehicleInfo.type || 'Not specified'}</p>
                        <p><strong>Vehicle Model:</strong> ${vehicleInfo.model || 'Not specified'}</p>
                        <p><strong>License Plate:</strong> ${vehicleInfo.plateNumber || 'Not specified'}</p>
                        ` : ''}
                        <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <p>Please review the application in your business dashboard and take appropriate action.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/business-owner/dashboard?tab=drivers" class="button">Review Application</a>
                    </div>
                    
                    <p>Best regards,<br>
                    <strong>Pick & Go System</strong></p>
                </div>
                <div class="footer">
                    <p>© 2025 Pick & Go. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Send generic notification email
    async sendNotificationEmail(to, subject, message, isHTML = false) {
        if (!this.transporter) {
            console.warn('Email service not configured. Cannot send notification email.');
            return { success: false, message: 'Email service not configured' };
        }

        try {
            const mailOptions = {
                from: {
                    name: 'Pick & Go',
                    address: process.env.EMAIL_USER
                },
                to: to,
                subject: subject
            };

            if (isHTML) {
                mailOptions.html = message;
            } else {
                mailOptions.text = message;
            }

            const info = await this.transporter.sendMail(mailOptions);

            console.log('Notification email sent:', {
                messageId: info.messageId,
                recipient: to,
                subject: subject
            });

            return {
                success: true,
                messageId: info.messageId,
                message: 'Email sent successfully'
            };

        } catch (error) {
            console.error('Error sending notification email:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}

module.exports = new EmailService();
