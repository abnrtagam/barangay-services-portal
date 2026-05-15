// ── authRoutes.js ─────────────────────────────────────────
const router = require('express').Router()
const ctrl   = require('../controllers/authController')
const upload = require('../middleware/uploadMiddleware')

// Registration with OTP and document upload
router.post('/register', upload.array('documents', 3), ctrl.register)
router.post('/verify-otp', ctrl.verifyOTP)
router.post('/resend-otp', ctrl.resendOTP)

// Login
router.post('/login',        ctrl.login)
router.post('/admin-login',  ctrl.adminLogin)
router.post('/forgot-password', ctrl.forgotPassword)
router.post('/reset-password',  ctrl.resetPassword)
router.post('/reactivate',      ctrl.requestReactivation)

module.exports = router
