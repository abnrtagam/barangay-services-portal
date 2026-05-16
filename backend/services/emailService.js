/**
 * Email Service using Nodemailer
 * 
 * This service sends OTP verification emails to residents during registration.
 * Uses Gmail SMTP with App Password for secure, free email sending on localhost.
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
    console.log('Email service is ready to send messages')
    return true
  } catch (error) {
    console.error('Email service error:', error.message)
    console.error('Make sure GMAIL_USER and GMAIL_APP_PASSWORD are set in .env')
    return false
  }
}

/**
 * Send OTP verification email
 */
const sendOTPEmail = async (to, otp, firstName = 'Resident') => {
  const mailOptions = {
    from: {
      name: 'Barangay Bulua Portal',
      address: process.env.GMAIL_USER,
    },
    to,
    subject: 'Email Verification - Barangay Bulua',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #1e293b; line-height: 1.6; }
          .header { background: #1e40af; color: white; padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0; }
          .header .brand { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; opacity: 0.9; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
          .content { background: #ffffff; padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; }
          .otp-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0; }
          .otp-code { font-size: 42px; font-weight: 800; color: #1e40af; letter-spacing: 12px; margin: 12px 0; font-family: 'Monaco', monospace; }
          .otp-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
          .footer { text-align: center; padding: 32px; color: #94a3b8; font-size: 12px; }
          .guideline-box { background: #f1f5f9; border-radius: 8px; padding: 20px; margin-top: 24px; }
          .guideline-title { font-weight: 700; font-size: 14px; color: #334155; margin-bottom: 8px; display: block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Barangay Bulua</div>
            <h1>Citizen Services Portal</h1>
          </div>
          <div class="content">
            <h2 style="font-size: 20px; font-weight: 700; margin-top: 0;">Verify Your Email</h2>
            <p>Hello ${firstName},</p>
            <p>Welcome to the Barangay Bulua digital portal! To ensure the security of your account and verify your residency, please enter the following One-Time Password (OTP) in the registration screen.</p>
            
            <div class="otp-card">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>

            <div class="guideline-box">
              <span class="guideline-title">Important Guidelines:</span>
              <ul style="font-size: 13px; color: #475569; margin: 0; padding-left: 20px;">
                <li>This code is valid for <strong>10 minutes</strong> only.</li>
                <li>Never share your OTP with anyone, including Barangay staff.</li>
                <li>After verification, your documents will be queued for administrative review.</li>
              </ul>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">If you did not initiate this registration, please ignore this email or contact our support team if you suspect unauthorized use of your email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Barangay Bulua. All rights reserved.</p>
            <p>Cagayan de Oro City, Philippines</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('OTP email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send account approval notification
 */
const sendApprovalEmail = async (to, firstName, isApproved) => {
  const mailOptions = {
    from: {
      name: 'Barangay Bulua Portal',
      address: process.env.GMAIL_USER,
    },
    to,
    subject: isApproved ? 'Account Approved - Barangay Bulua' : 'Account Update - Barangay Bulua',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; }
          .header { background: #1e40af; color: white; padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0; }
          .header .brand { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; opacity: 0.9; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; }
          .content { background: #ffffff; padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; }
          .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 16px; 
            background: ${isApproved ? '#ecfdf5' : '#f8fafc'}; color: ${isApproved ? '#059669' : '#1e40af'}; }
          .footer { text-align: center; padding: 32px; color: #94a3b8; font-size: 12px; }
          .button { display: inline-block; padding: 14px 32px; background: #1e40af; color: white; text-decoration: none; border-radius: 10px; font-weight: 700; margin-top: 24px; }
          .info-item { display: flex; align-items: start; gap: 12px; margin-bottom: 12px; font-size: 14px; }
          .check-icon { color: #1e40af; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Barangay Bulua</div>
            <h1>Citizen Services Portal</h1>
          </div>
          <div class="content">
            <div class="status-badge">${isApproved ? 'Registration Approved' : 'Application Status Update'}</div>
            <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #0f172a;">Hello ${firstName},</h2>
            
            ${isApproved ? `
              <p>Great news! Your resident account has been officially <strong>approved</strong>. You are now part of our digital community and have full access to our online services.</p>
              
              <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin: 24px 0;">
                <p style="margin: 0 0 12px; font-weight: 700; color: #334155;">What you can do now:</p>
                <div class="info-item"><span class="check-icon">✓</span> <span>Book appointments for certificates and clearances</span></div>
                <div class="info-item"><span class="check-icon">✓</span> <span>Submit and track complaints or concerns</span></div>
                <div class="info-item"><span class="check-icon">✓</span> <span>Receive real-time barangay announcements</span></div>
                <div class="info-item"><span class="check-icon">✓</span> <span>Manage your official resident profile</span></div>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to Your Account</a>
              </div>
            ` : `
              <p>Thank you for your interest in joining the Barangay Bulua portal. Unfortunately, your registration could not be approved at this time.</p>
              
              <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 12px; font-weight: 700; color: #1e293b;">Why was it rejected?</p>
                <p style="margin: 0; font-size: 14px; color: #475569;">This usually happens due to incomplete or blurred residency documents, or details that don't match our official records.</p>
              </div>

              <p style="font-weight: 700; color: #1e293b;">Next Steps:</p>
              <p>Please visit the Barangay Hall during office hours (8:00 AM - 5:00 PM) with your original valid ID and proof of residency. Our staff will assist you in manually verifying your account.</p>
            `}
            
            <p style="margin-top: 32px; font-size: 14px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 24px;">Thank you for your cooperation as we build a more efficient Barangay Bulua.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Barangay Bulua. All rights reserved.</p>
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

/**
 * Send complaint status update email
 */
const sendComplaintStatusEmail = async (to, firstName = 'Resident', subject = 'your complaint', status = '', adminRemarks = '') => {
  const mailOptions = {
    from: {
      name: 'Barangay Bulua Portal',
      address: process.env.GMAIL_USER,
    },
    to,
    subject: `Update: Complaint Status - ${status}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; }
          .header { background: #1e40af; color: white; padding: 32px 20px; text-align: center; border-radius: 16px 16px 0 0; }
          .header .brand { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; opacity: 0.9; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
          .content { background: #ffffff; padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; }
          .info-card { background: #f8fafc; border-left: 4px solid #1e40af; padding: 24px; margin: 24px 0; border-radius: 0 8px 8px 0; }
          .footer { text-align: center; padding: 32px; color: #94a3b8; font-size: 12px; }
          .guideline-box { border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin-top: 24px; font-size: 13px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Barangay Bulua</div>
            <h1>Complaint Status Update</h1>
          </div>
          <div class="content">
            <p>Hello ${firstName},</p>
            <p>We are writing to inform you that the status of your complaint regarding <strong>"${subject}"</strong> has been updated by the Barangay Administration.</p>
            
            <div class="info-card">
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Current Status</p>
              <p style="margin: 4px 0 16px 0; font-size: 20px; font-weight: 800; color: #1e40af;">${status}</p>
              
              ${adminRemarks ? `
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Admin Remarks</p>
                <p style="margin: 4px 0 0 0; font-size: 15px; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${adminRemarks}</p>
              ` : ''}
            </div>

            <div class="guideline-box">
              <p style="margin: 0 0 8px; font-weight: 700;">Guidelines:</p>
              <ul style="margin: 0; padding-left: 20px;">
                <li>You can track the full history of this complaint in your dashboard.</li>
                <li>If the status is "Resolved" but you feel the issue persists, you may file a new report or visit the office.</li>
                <li>Your safety and confidentiality are always protected.</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/complaints" style="display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Track in Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Barangay Bulua. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Complaint status email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send complaint status email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send appointment status update email
 */
const sendAppointmentStatusEmail = async (to, firstName = 'Resident', appointmentDate = '', timeSlot = '', status = '', adminRemarks = '') => {
  const mailOptions = {
    from: {
      name: 'Barangay Bulua Portal',
      address: process.env.GMAIL_USER,
    },
    to,
    subject: `Update: Appointment Status - ${status}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; }
          .header { background: #1e40af; color: white; padding: 32px 20px; text-align: center; border-radius: 16px 16px 0 0; }
          .header .brand { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; opacity: 0.9; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
          .content { background: #ffffff; padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; }
          .info-card { background: #f8fafc; border-left: 4px solid #1e40af; padding: 24px; margin: 24px 0; border-radius: 0 8px 8px 0; }
          .footer { text-align: center; padding: 32px; color: #94a3b8; font-size: 12px; }
          .instruction-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Barangay Bulua</div>
            <h1>Appointment Status Update</h1>
          </div>
          <div class="content">
            <p>Hello ${firstName},</p>
            <p>Your appointment on <strong>${appointmentDate}</strong> at <strong>${timeSlot}</strong> has been updated.</p>
            
            <div class="info-card">
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">New Status</p>
              <p style="margin: 4px 0 16px 0; font-size: 20px; font-weight: 800; color: #1e40af;">${status}</p>
              
              ${adminRemarks ? `
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Admin Remarks</p>
                <p style="margin: 4px 0 0 0; font-size: 15px; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${adminRemarks}</p>
              ` : ''}
            </div>

            <div class="instruction-box">
              <p style="margin: 0 0 12px; font-weight: 800; color: #1e293b;">Guidelines for your Visit:</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
                <li>Please arrive at the Barangay Hall <strong>10 minutes</strong> before your scheduled time.</li>
                <li>Bring a <strong>Valid Government ID</strong> and any supporting documents related to your request.</li>
                <li>If the status is "Approved", please proceed to the designated window on your chosen date.</li>
                <li>If you cannot make it, please cancel or reschedule through the portal at least 24 hours in advance.</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Barangay Bulua. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Appointment status email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send appointment status email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send password reset OTP email
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code for password reset
 * @param {string} firstName - User's first name for personalization
 */
const sendPasswordResetOTPEmail = async (to, otp, firstName = 'Resident') => {
  const mailOptions = {
    from: {
      name: 'Barangay Bulua Portal',
      address: process.env.GMAIL_USER,
    },
    to,
    subject: 'Password Reset - Barangay Bulua',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; }
          .header { background: #1e40af; color: white; padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0; }
          .header .brand { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; opacity: 0.9; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
          .content { background: #ffffff; padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; }
          .otp-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0; }
          .otp-code { font-size: 42px; font-weight: 800; color: #1e40af; letter-spacing: 12px; margin: 12px 0; }
          .footer { text-align: center; padding: 32px; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Barangay Bulua</div>
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2 style="font-size: 20px; font-weight: 700; margin-top: 0;">Hello ${firstName},</h2>
            <p>We received a request to reset the password for your Barangay Bulua portal account. To proceed, please use the following reset code.</p>
            
            <div class="otp-card">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Reset Code</div>
              <div class="otp-code">${otp}</div>
            </div>

            <p style="font-size: 14px; color: #64748b;"><strong>Security Note:</strong> This code will expire in 15 minutes. If you did not request a password reset, your account is still secure, and you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Barangay Bulua. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Password reset OTP email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send password reset OTP email:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  verifyConnection,
  sendOTPEmail,
  sendApprovalEmail,
  sendComplaintStatusEmail,
  sendAppointmentStatusEmail,
  sendPasswordResetOTPEmail,
}
