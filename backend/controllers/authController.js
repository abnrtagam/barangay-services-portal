const db = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const emailService = require('../services/emailService')
const crypto = require('crypto')

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Check rate limiting for registration attempts
 */
const checkRateLimit = async (ipAddress, email) => {
  return; // Disabled for testing/development
  const [attempts] = await db.query(
    'SELECT * FROM registration_attempts WHERE ip_address = ?',
    [ipAddress]
  )

  if (attempts.length) {
    const attempt = attempts[0]
    
    // Check if blocked
    if (attempt.blocked_until && new Date(attempt.blocked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(attempt.blocked_until) - new Date()) / 60000)
      throw new Error(`Too many registration attempts. Please try again in ${minutesLeft} minutes.`)
    }

    // Check attempt count in last hour
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    if (new Date(attempt.last_attempt) > hourAgo && attempt.attempt_count >= 20) {
      // Block for 1 hour
      const blockUntil = new Date(Date.now() + 60 * 60 * 1000)
      await db.query(
        'UPDATE registration_attempts SET blocked_until = ?, attempt_count = attempt_count + 1 WHERE ip_address = ?',
        [blockUntil, ipAddress]
      )
      throw new Error('Too many registration attempts. Please try again in 1 hour.')
    }

    // Reset count if last attempt was over an hour ago
    if (new Date(attempt.last_attempt) < hourAgo) {
      await db.query(
        'UPDATE registration_attempts SET attempt_count = 1, last_attempt = NOW() WHERE ip_address = ?',
        [ipAddress]
      )
    } else {
      // Increment attempt count
      await db.query(
        'UPDATE registration_attempts SET attempt_count = attempt_count + 1, last_attempt = NOW() WHERE ip_address = ?',
        [ipAddress]
      )
    }
  } else {
    // First attempt from this IP
    await db.query(
      'INSERT INTO registration_attempts (ip_address, email, attempt_count) VALUES (?, ?, 1)',
      [ipAddress, email]
    )
  }
}

/**
 * Check rate limiting for login attempts
 */
const checkLoginRateLimit = async (email, ipAddress) => {
  return; // Disabled for testing/development
  const [attempts] = await db.query(
    'SELECT * FROM login_attempts WHERE email = ? AND ip_address = ?',
    [email, ipAddress]
  )

  if (attempts.length) {
    const attempt = attempts[0]
    
    // Check if currently blocked
    if (attempt.blocked_until && new Date(attempt.blocked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(attempt.blocked_until) - new Date()) / 60000)
      throw new Error(`Too many failed login attempts. Please try again in ${minutesLeft} minutes.`)
    }

    // Reset count if last attempt was over 15 minutes ago
    const cooldown = new Date(Date.now() - 15 * 60 * 1000)
    if (new Date(attempt.last_attempt) < cooldown) {
      await db.query(
        'UPDATE login_attempts SET attempt_count = 0, blocked_until = NULL WHERE id = ?',
        [attempt.id]
      )
    }
  }
}

/**
 * Record a failed login attempt
 */
const recordFailedLogin = async (email, ipAddress) => {
  const [attempts] = await db.query(
    'SELECT * FROM login_attempts WHERE email = ? AND ip_address = ?',
    [email, ipAddress]
  )

  if (attempts.length) {
    const attempt = attempts[0]
    const newCount = attempt.attempt_count + 1
    let blockedUntil = null

    // Block for 15 minutes after 5 failed attempts
    if (newCount >= 5) {
      blockedUntil = new Date(Date.now() + 15 * 60 * 1000)
    }

    await db.query(
      'UPDATE login_attempts SET attempt_count = ?, blocked_until = ?, last_attempt = NOW() WHERE id = ?',
      [newCount, blockedUntil, attempt.id]
    )
  } else {
    await db.query(
      'INSERT INTO login_attempts (email, ip_address, attempt_count) VALUES (?, ?, 1)',
      [email, ipAddress]
    )
  }
}

/**
 * Reset failed login attempts on success
 */
const resetLoginAttempts = async (email, ipAddress) => {
  await db.query(
    'DELETE FROM login_attempts WHERE email = ? AND ip_address = ?',
    [email, ipAddress]
  )
}

// POST /api/auth/register
exports.register = async (req, res) => {
  const { first_name, last_name, dob, email, phone, address, zone, gov_id_type, gov_id_number, password } = req.body
  
  // Validation — tell the user exactly which field is missing
  const requiredFields = { first_name: 'First Name', last_name: 'Last Name', dob: 'Date of Birth', email: 'Email Address', phone: 'Phone Number', address: 'Home Address', zone: 'Zone', gov_id_type: 'Government ID Type', gov_id_number: 'Government ID Number', password: 'Password' }
  const missing = Object.entries(requiredFields).filter(([key]) => !req.body[key]).map(([, label]) => label)
  if (missing.length) {
    return res.status(422).json({ message: `Missing required fields: ${missing.join(', ')}` })
  }


  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(422).json({ message: 'Invalid email format.' })
  }

  // Password strength validation
  if (password.length < 5) {
    return res.status(422).json({ message: 'Password must be at least 5 characters.' })
  }

  // Phone validation (Philippine format)
  const phoneRegex = /^(09|\+639)\d{9}$/
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return res.status(422).json({ message: 'Invalid phone number format. Use 09XXXXXXXXX.' })
  }

  // Length validations
  if (first_name.length > 50 || last_name.length > 50) {
    return res.status(422).json({ message: 'Name is too long (max 50 chars).' })
  }
  if (address.length > 255) {
    return res.status(422).json({ message: 'Address is too long (max 255 chars).' })
  }
  if (email.length > 100) {
    return res.status(422).json({ message: 'Email is too long (max 100 chars).' })
  }
  if (gov_id_number.length > 50) {
    return res.status(422).json({ message: 'ID number is too long (max 50 chars).' })
  }

  try {
    await checkRateLimit(req.ip, email)

    // Check for existing email
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length) {
      return res.status(409).json({ message: 'Email already registered.' })
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12)

    // Handle uploaded documents (required)
    if (!req.files || req.files.length === 0) {
      return res.status(422).json({ message: 'Please upload at least one proof of residency document.' })
    }
    const documentPaths = JSON.stringify(req.files.map(file => file.filename))

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP
    await db.query(
      'INSERT INTO otp_verifications (email, otp_code, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    )

    // Create user account (status: pending, email_verified: false)
    const [result] = await db.query(
      `INSERT INTO users (first_name, last_name, dob, email, phone, address, zone, gov_id_type, gov_id_number, password, role, status, email_verified, verification_documents, created_at) 
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [first_name, last_name, dob, email, phone, address, zone, gov_id_type, gov_id_number, hash, 'resident', 'pending', false, documentPaths]
    )

    const userId = result.insertId
    await db.query('INSERT INTO residents (user_id) VALUES (?)', [userId])

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, first_name)
    
    if (!emailResult.success) {
      // If email fails, still allow registration but log the error
      console.error('Failed to send OTP email:', emailResult.error)
      return res.status(201).json({ 
        message: 'Registration successful, but OTP email failed to send. Please contact admin.',
        requiresOTP: true,
        email 
      })
    }

    res.status(201).json({ 
      message: 'Registration successful! Please check your email for the verification code.',
      requiresOTP: true,
      email
    })
  } catch (err) {
    console.error(err)
    if (err.message.includes('Too many')) {
      return res.status(429).json({ message: err.message })
    }
    res.status(500).json({ message: 'Registration failed. Please try again.' })
  }
}

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(422).json({ message: 'Email and OTP are required.' })
  }

  try {
    // Find OTP record
    const [otpRecords] = await db.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp_code = ? AND verified = FALSE ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    )

    if (!otpRecords.length) {
      return res.status(401).json({ message: 'Invalid OTP code.' })
    }

    const otpRecord = otpRecords[0]

    // Check if expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(401).json({ message: 'OTP has expired. Please request a new one.' })
    }

    // Mark OTP as verified
    await db.query(
      'UPDATE otp_verifications SET verified = TRUE WHERE id = ?',
      [otpRecord.id]
    )

    // Update user email_verified status
    await db.query(
      'UPDATE users SET email_verified = TRUE WHERE email = ?',
      [email]
    )

    res.json({ 
      message: 'Email verified successfully! Your account is pending admin approval.',
      verified: true 
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'OTP verification failed.' })
  }
}

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(422).json({ message: 'Email is required.' })
  }

  try {
    // Check if user exists
    const [users] = await db.query(
      'SELECT first_name, email_verified FROM users WHERE email = ?',
      [email]
    )

    if (!users.length) {
      return res.status(404).json({ message: 'Account not found.' })
    }

    if (users[0].email_verified) {
      return res.status(400).json({ message: 'Email already verified.' })
    }

    // Check if recently sent (prevent spam)
    const [recent] = await db.query(
      'SELECT created_at FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    )

    if (recent.length) {
      const timeSinceLastOTP = (Date.now() - new Date(recent[0].created_at)) / 1000
      if (timeSinceLastOTP < 60) {
        return res.status(429).json({ 
          message: `Please wait ${Math.ceil(60 - timeSinceLastOTP)} seconds before requesting another OTP.` 
        })
      }
    }

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Save new OTP
    await db.query(
      'INSERT INTO otp_verifications (email, otp_code, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    )

    // Send email
    await emailService.sendOTPEmail(email, otp, users[0].first_name)

    res.json({ message: 'New OTP sent to your email.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to resend OTP.' })
  }
}

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(422).json({ message: 'Email and password required.' })
  }

  try {
    await checkLoginRateLimit(email, req.ip)
    const [rows] = await db.query(
      `SELECT u.*, r.id AS resident_id 
       FROM users u 
       LEFT JOIN residents r ON u.id = r.user_id 
       WHERE u.email = ? AND u.role = "resident"`,
      [email]
    )

    if (!rows.length) {
      await recordFailedLogin(email, req.ip)
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const user = rows[0]

    // Check password
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      await recordFailedLogin(email, req.ip)
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    // Check email verification
    if (!user.email_verified) {
      return res.status(403).json({ 
        message: 'Please verify your email first. Check your inbox for the OTP code.',
        requiresOTP: true,
        email: user.email
      })
    }

    // Check account status
    if (user.status === 'pending') {
      return res.status(403).json({ 
        message: 'Your account is pending verification by the barangay administrator. You will be notified via email once approved.',
        status: 'pending'
      })
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ 
        message: 'Your account registration was not approved. Please contact the barangay office for more information.',
        status: 'rejected'
      })
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ 
        message: 'Your account has been suspended. Please contact the barangay office.',
        status: 'suspended'
      })
    }

    // Only approved users can login
    if (user.status !== 'approved') {
      return res.status(403).json({ message: 'Access denied.' })
    }

    // Success - reset attempts
    await resetLoginAttempts(email, req.ip)

    // Generate token
    const token = sign({ id: user.id, resident_id: user.resident_id, role: 'resident' })
    const { password: _, ...safeUser } = user

    res.json({ token, user: safeUser })
  } catch (err) {
    console.error(err)
    if (err.message.includes('Too many')) {
      return res.status(429).json({ message: err.message })
    }
    res.status(500).json({ message: 'Login failed.' })
  }
}

// POST /api/auth/admin-login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(422).json({ message: 'Email and password required.' })
  }

  try {
    await checkLoginRateLimit(email, req.ip)
    const [rows] = await db.query(
      `SELECT u.*, a.id AS admin_id 
       FROM users u 
       LEFT JOIN admins a ON u.id = a.user_id 
       WHERE u.email = ? AND u.role = "admin"`,
      [email]
    )

    if (!rows.length) {
      await recordFailedLogin(email, req.ip)
      return res.status(401).json({ message: 'Invalid admin credentials.' })
    }

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    
    if (!match) {
      await recordFailedLogin(email, req.ip)
      return res.status(401).json({ message: 'Invalid admin credentials.' })
    }

    // Success - reset attempts
    await resetLoginAttempts(email, req.ip)

    const token = sign({ 
      id: user.id, 
      admin_id: user.admin_id, 
      role: 'admin', 
      name: `${user.first_name} ${user.last_name}` 
    })
    
    const { password: _, ...safeUser } = user

    res.json({ 
      token, 
      user: { ...safeUser, name: `${user.first_name} ${user.last_name}` } 
    })
  } catch (err) {
    console.error(err)
    if (err.message.includes('Too many')) {
      return res.status(429).json({ message: err.message })
    }
    res.status(500).json({ message: 'Login failed.' })
  }
}

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(422).json({ message: 'Email is required.' })
  }

  try {
    // Check if user exists
    const [users] = await db.query(
      'SELECT id, first_name FROM users WHERE email = ?',
      [email]
    )

    if (!users.length) {
      // Don't reveal if email exists for security
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      })
    }

    const user = users[0]

    // Check if recently requested (prevent spam)
    const [recent] = await db.query(
      'SELECT created_at FROM password_reset_tokens WHERE email = ? AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [email]
    )

    if (recent.length) {
      const timeSinceLastRequest = (Date.now() - new Date(recent[0].created_at)) / 1000
      if (timeSinceLastRequest < 300) { // 5 minutes cooldown
        return res.status(429).json({ 
          message: `Please wait ${Math.ceil(300 - timeSinceLastRequest)} seconds before requesting another reset.` 
        })
      }
    }

    // Generate OTP and token
    const otp = generateOTP()
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save password reset token
    await db.query(
      'INSERT INTO password_reset_tokens (email, token, otp_code, expires_at) VALUES (?, ?, ?, ?)',
      [email, token, otp, expiresAt]
    )

    // Send OTP via email
    const emailResult = await emailService.sendPasswordResetOTPEmail(email, otp, user.first_name)
    
    if (!emailResult.success) {
      console.error('Failed to send password reset OTP email:', emailResult.error)
      // Still return success to user for security (don't reveal if email failed)
    }

    res.status(200).json({ 
      message: 'If an account exists with this email, you will receive password reset instructions.',
      email // Safe to return for frontend
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to process password reset request.' })
  }
}

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body

  if (!email || !otp || !newPassword || !confirmPassword) {
    return res.status(422).json({ message: 'All fields are required.' })
  }

  if (newPassword !== confirmPassword) {
    return res.status(422).json({ message: 'Passwords do not match.' })
  }

  // Password strength validation
  if (newPassword.length < 5) {
    return res.status(422).json({ message: 'Password must be at least 5 characters.' })
  }

  try {
    // Find valid reset token
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE email = ? AND otp_code = ? AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    )

    if (!tokens.length) {
      return res.status(401).json({ message: 'Invalid or expired reset code.' })
    }

    const resetToken = tokens[0]

    // Check if expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(401).json({ message: 'Reset code has expired. Please request a new one.' })
    }

    // Check if user exists
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (!users.length) {
      return res.status(404).json({ message: 'User not found.' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await db.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    )

    // Mark token as used
    await db.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?',
      [resetToken.id]
    )

    res.json({ message: 'Password reset successfully. You can now login with your new password.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Password reset failed.' })
  }
}

// POST /api/auth/reactivate (suspended users only)
exports.requestReactivation = async (req, res) => {
  const { email, reason } = req.body

  if (!email || !reason) {
    return res.status(422).json({ message: 'Email and reason are required.' })
  }

  try {
    // Check if user exists and is suspended
    const [users] = await db.query(
      'SELECT id, status FROM users WHERE email = ? AND role = "resident"',
      [email]
    )

    if (!users.length) {
      return res.status(404).json({ message: 'Account not found.' })
    }

    const user = users[0]
    if (user.status !== 'suspended') {
      return res.status(400).json({ message: 'Only suspended accounts can request reactivation.' })
    }

    // Check if there's already a pending request
    const [existing] = await db.query(
      'SELECT id FROM reactivation_requests WHERE user_id = ? AND status = "Pending"',
      [user.id]
    )

    if (existing.length) {
      return res.status(409).json({ message: 'You already have a pending reactivation request.' })
    }

    // Create request (Create table if not exists - better to do in setup but here for robustness)
    await db.query(
      `CREATE TABLE IF NOT EXISTS reactivation_requests (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        user_id INT NOT NULL, 
        reason TEXT NOT NULL, 
        status ENUM('Pending', 'Reviewed', 'Approved', 'Rejected') DEFAULT 'Pending', 
        admin_notes TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    )

    await db.query(
      'INSERT INTO reactivation_requests (user_id, reason) VALUES (?, ?)',
      [user.id, reason]
    )

    res.status(201).json({ message: 'Reactivation request submitted. The barangay office will review your appeal.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to submit reactivation request.' })
  }
}

// POST /api/auth/update-fcm-token
exports.updateFcmToken = async (req, res) => {
  const { fcm_token } = req.body
  const userId = req.user.id // From authMiddleware

  if (!fcm_token) {
    return res.status(422).json({ message: 'FCM token is required.' })
  }

  try {
    // Ensure fcm_token column exists (Robustness)
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255) DEFAULT NULL`)
    
    await db.query('UPDATE users SET fcm_token = ? WHERE id = ?', [fcm_token, userId])
    res.json({ message: 'FCM token updated successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update FCM token.' })
  }
}

// POST /api/auth/admin-forgot-password
exports.adminForgotPassword = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(422).json({ message: 'Email is required.' })
  }

  try {
    // Check if admin user exists
    const [users] = await db.query(
      'SELECT id, first_name FROM users WHERE email = ? AND role = "admin"',
      [email]
    )

    if (!users.length) {
      return res.status(200).json({ 
        message: 'If an admin account exists with this email, you will receive password reset instructions.' 
      })
    }

    const user = users[0]

    // Check if recently requested (prevent spam)
    const [recent] = await db.query(
      'SELECT created_at FROM password_reset_tokens WHERE email = ? AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [email]
    )

    if (recent.length) {
      const timeSinceLastRequest = (Date.now() - new Date(recent[0].created_at)) / 1000
      if (timeSinceLastRequest < 300) { // 5 minutes cooldown
        return res.status(429).json({ 
          message: `Please wait ${Math.ceil(300 - timeSinceLastRequest)} seconds before requesting another reset.` 
        })
      }
    }

    // Generate OTP and token
    const otp = generateOTP()
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save password reset token
    await db.query(
      'INSERT INTO password_reset_tokens (email, token, otp_code, expires_at) VALUES (?, ?, ?, ?)',
      [email, token, otp, expiresAt]
    )

    // Send OTP via email
    const emailResult = await emailService.sendPasswordResetOTPEmail(email, otp, user.first_name)
    
    if (!emailResult.success) {
      console.error('Failed to send admin password reset OTP email:', emailResult.error)
    }

    res.status(200).json({ 
      message: 'If an admin account exists with this email, you will receive password reset instructions.',
      email 
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to process password reset request.' })
  }
}

// POST /api/auth/admin-reset-password
exports.adminResetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body

  if (!email || !otp || !newPassword || !confirmPassword) {
    return res.status(422).json({ message: 'All fields are required.' })
  }

  if (newPassword !== confirmPassword) {
    return res.status(422).json({ message: 'Passwords do not match.' })
  }

  if (newPassword.length < 5) {
    return res.status(422).json({ message: 'Password must be at least 5 characters.' })
  }

  try {
    // Find valid reset token
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE email = ? AND otp_code = ? AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    )

    if (!tokens.length) {
      return res.status(401).json({ message: 'Invalid or expired reset code.' })
    }

    const resetToken = tokens[0]

    // Check if expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(401).json({ message: 'Reset code has expired. Please request a new one.' })
    }

    // Check if admin user exists
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ? AND role = "admin"',
      [email]
    )

    if (!users.length) {
      return res.status(404).json({ message: 'Admin user not found.' })
    }

    const userId = users[0].id

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    )

    // Mark token as used
    await db.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?',
      [resetToken.id]
    )

    res.status(200).json({ message: 'Password has been successfully reset.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to reset password.' })
  }
}

// POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body
  const userId = req.user.id

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(422).json({ message: 'All fields are required.' })
  }

  if (newPassword !== confirmPassword) {
    return res.status(422).json({ message: 'New passwords do not match.' })
  }

  if (newPassword.length < 5) {
    return res.status(422).json({ message: 'New password must be at least 5 characters.' })
  }

  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId])
    if (!rows.length) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const user = rows[0]
    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect.' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId])

    res.json({ message: 'Password changed successfully.' })
  } catch (err) {
    console.error(err)
// ... changePassword logic ends above ...
    res.status(500).json({ message: 'Failed to change password.' })
  }
}

// GET /api/auth/check-status
exports.checkStatus = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT status FROM users WHERE id = ?',
      [req.user.id]
    )

    if (!users.length) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const user = users[0]
    if (user.status === 'suspended') {
      return res.json({ status: 'suspended' })
    }

    res.json({ status: 'active' })
  } catch (err) {
    console.error('Error in check-status endpoint:', err)
    res.status(500).json({ message: 'Server error checking status.' })
  }
}


