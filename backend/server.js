require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const morgan   = require('morgan')
const path     = require('path')
const emailService = require('./services/emailService')

const app = express()

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Verify Email Service ────────────────────────────────────
emailService.verifyConnection()

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/authRoutes'))
app.use('/api/complaints',    require('./routes/complaintRoutes'))
app.use('/api/appointments',  require('./routes/appointmentRoutes'))
app.use('/api/residents',     require('./routes/residentRoutes'))
app.use('/api/admin',         require('./routes/adminRoutes'))
app.use('/api/admin/verifications', require('./routes/verificationRoutes'))
app.use('/api/announcements', require('./routes/announcementRoutes'))

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }))

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }))

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
