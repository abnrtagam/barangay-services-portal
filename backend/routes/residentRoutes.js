const router = require('express').Router()
const rCtrl  = require('../controllers/residentController')
const cCtrl  = require('../controllers/complaintController')
const aCtrl  = require('../controllers/appointmentController')
const auth   = require('../middleware/authMiddleware')
const role   = require('../middleware/roleMiddleware')

router.use(auth, role('resident'))
router.get('/dashboard-stats', rCtrl.getDashboardStats)
router.get('/complaints',      cCtrl.getMyComplaints)
router.get('/complaints/:id',  cCtrl.getMyComplaintById)
router.get('/appointments',    aCtrl.getMyAppointments)
router.get('/appointments/:id', aCtrl.getMyAppointmentById)
router.get('/notifications',    rCtrl.getNotifications)
router.patch('/profile',        rCtrl.updateProfile)


module.exports = router
