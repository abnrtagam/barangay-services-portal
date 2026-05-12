/**
 * Email Service using Nodemailer
 * 
 * This service sends OTP verification emails to residents during registration.
 * Uses Gmail SMTP with App Password for secure, free email sending on localhost.
 * 
 * SETUP INSTRUCTIONS FOR BEGINNERS:
 * =================================
 * 
 * 1. Create a Gmail App Password:
 *    - Go to https://myaccount.google.com/security
 *    - Enable "2-Step Verification" if not already enabled
 *    - Go to https://myaccount.google.com/apppasswords
 *    - Select "Mail" and "Other (Custom name)"
 *    - Name it "Barangay System"
 *    - Copy the 16-character password (e.g., "abcd efgh ijkl mnop")
 * 
 * 2. Add to your .env file:
 *    GMAIL_USER=your.gmail@gmail.com
 *    GMAIL_APP_PASSWORD=abcdefghijklmnop  (no spaces!)
 * 
 * 3. That's it! No deployment needed. Works on localhost.
 */

const nodemailer = require('nodemailer')

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

/**
 * Verify email configuration
 */
const verifyConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ Email service is ready to send messages')
    return true
  } catch (error) {
    console.error('❌ Email service error:', error.message)
    console.error('Make sure GMAIL_USER and GMAIL_APP_PASSWORD are set in .env')
    return false
  }
}

/**
 * Send OTP verification email
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} firstName - User's first name for personalization
 */
const sendOTPEmail = async (to, otp, firstName = 'Resident') => {
  const mailOptions = {
    from: {
      name: 'Barangay Portal',
      address: process.env.GMAIL_USER,
    },
    to,
    subject: '🔐 Email Verification - Barangay Portal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .logo { width: 60px; height: 60px; margin: 0 auto 15px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .otp-box { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .otp-label { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 6px; font-size: 14px; }
          .footer { text-align: center; color: #6b7280; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L4 11v2h24v-2L16 4zM6 14v10h4V14H6zm8 0v10h4V14h-4zm8 0v10h4V14h-4zM4 26h24v2H4v-2z" fill="white"/>
              </svg>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Email Verification</h1>
            <p style="margin: 10px 0 0; opacity: 0.95; font-size: 15px;">Barangay Citizen Services Portal</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1e40af; margin-top: 0;">Hello, ${firstName}! 👋</h2>
            
            <p>Thank you for registering with the Barangay Portal. To complete your registration, please verify your email address using the One-Time Password (OTP) below:</p>
            
            <div class="otp-box">
              <div class="otp-label">YOUR VERIFICATION CODE</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="warning">
              <strong>⏰ Important:</strong> This OTP will expire in <strong>10 minutes</strong>. Please enter it soon to verify your account.
            </div>
            
            <h3 style="color: #374151; font-size: 16px;">Next Steps:</h3>
            <ul style="color: #4b5563;">
              <li>Enter the OTP code in the verification page</li>
              <li>Your account will be submitted for barangay administrator review</li>
              <li>You will receive a notification once your account is approved</li>
              <li>After approval, you can access all barangay services</li>
            </ul>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                <strong style="color: #374151;">Security Tip:</strong> Never share this OTP with anyone. Barangay staff will never ask for your OTP code.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you didn't request this verification, please ignore this email or contact the barangay office.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Barangay Citizen Services Portal</strong></p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} Barangay Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ OTP email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send account approval notification
 */
const sendApprovalEmail = async (to, firstName, isApproved) => {
  const mailOptions = {
    from: {
      name: 'Barangay Portal',
      address: process.env.GMAIL_USER,
    },
    to,
    subject: isApproved 
      ? '✅ Account Approved - Barangay Portal' 
      : '❌ Account Not Approved - Barangay Portal',
    html: isApproved ? `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0;">🎉 Account Approved!</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #059669;">Hello, ${firstName}!</h2>
            <p>Great news! Your barangay account has been <strong>approved</strong> by the administrator.</p>
            <p>You can now access all barangay services including:</p>
            <ul>
              <li>File complaints</li>
              <li>Book appointments</li>
              <li>View announcements</li>
              <li>Track your requests</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login" style="display: inline-block; background: #059669; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600;">Login Now</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you have any questions, please contact the barangay office.</p>
          </div>
        </div>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0;">Account Status Update</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626;">Hello, ${firstName}</h2>
            <p>We regret to inform you that your barangay account registration could not be approved at this time.</p>
            <p><strong>Possible reasons:</strong></p>
            <ul>
              <li>Incomplete or unclear verification documents</li>
              <li>Address not within barangay jurisdiction</li>
              <li>Duplicate account detected</li>
              <li>Invalid identification documents</li>
            </ul>
            <p>Please visit the barangay office with valid identification and proof of residency for manual verification.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">For questions, contact the barangay office during office hours.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Failed to send approval email:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  verifyConnection,
  sendOTPEmail,
  sendApprovalEmail,
}
