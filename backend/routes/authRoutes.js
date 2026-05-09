// ── authRoutes.js ─────────────────────────────────────────
const router = require('express').Router()
const ctrl   = require('../controllers/authController')
router.post('/register',    ctrl.register)
router.post('/login',       ctrl.login)
router.post('/admin-login', ctrl.adminLogin)
module.exports = router
