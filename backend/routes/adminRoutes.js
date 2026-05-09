const router = require('express').Router()
const ctrl   = require('../controllers/adminController')
const ann    = require('../controllers/announcementController')
const auth   = require('../middleware/authMiddleware')
const role   = require('../middleware/roleMiddleware')

router.use(auth, role('admin'))

// Dashboard
router.get('/stats', ctrl.getStats)

// Complaints
router.get('/complaints',              ctrl.getComplaints)
router.patch('/complaints/:id/status', ctrl.updateComplaintStatus)

// Appointments
router.get('/appointments',               ctrl.getAppointments)
router.patch('/appointments/:id/status',  ctrl.updateAppointmentStatus)

// Residents
router.get('/residents', ctrl.getResidents)

// Announcements
router.post('/announcements',       ann.create)
router.put('/announcements/:id',    ann.update)
router.delete('/announcements/:id', ann.remove)

// Reports
router.get('/reports',         ctrl.getReports)
router.get('/reports/export',  ctrl.exportReport)

module.exports = router
