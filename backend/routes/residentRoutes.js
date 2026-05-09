const router = require('express').Router()
const rCtrl  = require('../controllers/residentController')
const cCtrl  = require('../controllers/complaintController')
const aCtrl  = require('../controllers/appointmentController')
const auth   = require('../middleware/authMiddleware')
const role   = require('../middleware/roleMiddleware')

router.use(auth, role('resident'))
router.get('/dashboard-stats', rCtrl.getDashboardStats)
router.get('/complaints',      cCtrl.getMyComplaints)
router.get('/appointments',    aCtrl.getMyAppointments)

module.exports = router
