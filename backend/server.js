require('dotenv').config()
const express = require('express')
const db = require('./config/db')
// Verify database connection and ensure new tables exist
;(async () => {
  try {
    await db.query('SELECT 1')
    console.log('✅ Database connected')
    // Ensure new feature tables exist
    await db.query(`CREATE TABLE IF NOT EXISTS admin_activity_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id BIGINT UNSIGNED NOT NULL,
      action_type VARCHAR(50) NOT NULL,
      target_type VARCHAR(50) NOT NULL,
      target_id BIGINT UNSIGNED DEFAULT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX(admin_id), INDEX(action_type), INDEX(created_at)
    ) ENGINE=InnoDB`)
    await db.query(`CREATE TABLE IF NOT EXISTS login_attempts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      ip_address VARCHAR(45) NOT NULL,
      attempt_count INT DEFAULT 1,
      last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      blocked_until TIMESTAMP NULL DEFAULT NULL,
      INDEX(email, ip_address)
    ) ENGINE=InnoDB`)
    await db.query(`CREATE TABLE IF NOT EXISTS registration_attempts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip_address VARCHAR(45) NOT NULL,
      email VARCHAR(255) DEFAULT NULL,
      attempt_count INT DEFAULT 1,
      last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      blocked_until TIMESTAMP NULL DEFAULT NULL,
      INDEX(ip_address)
    ) ENGINE=InnoDB`)
    await db.query(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(255) NOT NULL,
      otp_code VARCHAR(10) NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`)
    // Ensure two_factor_enabled column exists on users table
    try {
      await db.query(`ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE AFTER status`)
    } catch (e) { /* column already exists – ignore */ }
  } catch (err) {
    console.error('❌ Database connection failed:', err.message)
    process.exit(1)
  }
})()
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const emailService = require('./services/emailService')

const app = express()

// ── Middleware ──────────────────────────────────────────────
app.use(require('helmet')())
app.use(require('xss-clean')())

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Verify Email Service ────────────────────────────────────
emailService.verifyConnection()

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/complaints', require('./routes/complaintRoutes'))
app.use('/api/appointments', require('./routes/appointmentRoutes'))
app.use('/api/residents', require('./routes/residentRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/admin/verifications', require('./routes/verificationRoutes'))
app.use('/api/announcements', require('./routes/announcementRoutes'))

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }))

// ── Production: Serve React frontend ────────────────────────
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist')
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist))
}

// ── Fallback handler ────────────────────────────────────────
// API routes return 404 JSON; everything else serves React app
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Route not found.' })
  }
  // SPA fallback — let React Router handle client-side routes
  const indexPath = path.join(frontendDist, 'index.html')
  if (process.env.NODE_ENV === 'production') {
    return res.sendFile(indexPath)
  }
  res.status(404).json({ message: 'Route not found.' })
})

// ── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n🚀 Barangay Backend running at http://localhost:${PORT}`)
  console.log(`📁 Uploads served at http://localhost:${PORT}/uploads\n`)
})
