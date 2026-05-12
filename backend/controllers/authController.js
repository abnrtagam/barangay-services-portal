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
    if (new Date(attempt.last_attempt) > hourAgo && attempt.attempt_count >= 5) {
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

// POST /api/auth/register
exports.register = async (req, res) => {
  const { first_name, last_name, email, phone, address, password } = req.body
  
  // Validation
  if (!first_name || !last_name || !email || !phone || !address || !password) {
    return res.status(422).json({ message: 'All fields are required.' })
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(422).json({ message: 'Invalid email format.' })
  }

  // Password strength validation
  if (password.length < 8) {
    return res.status(422).json({ message: 'Password must be at least 8 characters.' })
  }

  // Phone validation (Philippine format)
  const phoneRegex = /^(09|\+639)\d{9}$/
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return res.status(422).json({ message: 'Invalid phone number format. Use 09XXXXXXXXX.' })
  }

  try {
    // Rate limiting
    const ipAddress = req.ip || req.connection.remoteAddress
    await checkRateLimit(ipAddress, email)

    // Check for existing email
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length) {
      return res.status(409).json({ message: 'Email already registered.' })
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12)

    // Handle uploaded documents
    let documentPaths = null
    if (req.files && req.files.length > 0) {
      documentPaths = JSON.stringify(req.files.map(file => file.filename))
    }

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
      `INSERT INTO users (first_name, last_name, email, phone, address, password, role, status, email_verified, verification_documents) 
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [first_name, last_name, email, phone, address, hash, 'resident', 'pending', false, documentPaths]
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
    const [rows] = await db.query(
      `SELECT u.*, r.id AS resident_id 
       FROM users u 
       LEFT JOIN residents r ON u.id = r.user_id 
       WHERE u.email = ? AND u.role = "resident"`,
      [email]
    )

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const user = rows[0]

    // Check password
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
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

    // Generate token
    const token = sign({ id: user.id, resident_id: user.resident_id, role: 'resident' })
    const { password: _, ...safeUser } = user

    res.json({ token, user: safeUser })
  } catch (err) {
    console.error(err)
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
    const [rows] = await db.query(
      `SELECT u.*, a.id AS admin_id 
       FROM users u 
       LEFT JOIN admins a ON u.id = a.user_id 
       WHERE u.email = ? AND u.role = "admin"`,
      [email]
    )

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid admin credentials.' })
    }

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    
    if (!match) {
      return res.status(401).json({ message: 'Invalid admin credentials.' })
    }

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
    res.status(500).json({ message: 'Login failed.' })
  }
}

module.exports = exports
