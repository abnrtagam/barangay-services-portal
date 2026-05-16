require('dotenv').config()
const express = require('express')
const db = require('./config/db')
// Verify database connection on startup
;(async () => {
  try {
    await db.query('SELECT 1')
    console.log('✅ Database connected')
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
