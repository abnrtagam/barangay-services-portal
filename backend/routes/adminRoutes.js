const router = require('express').Router()
const ctrl   = require('../controllers/adminController')
const ann    = require('../controllers/announcementController')
const actLog = require('../controllers/activityLogController')
const auth   = require('../middleware/authMiddleware')
const role   = require('../middleware/roleMiddleware')

router.use(auth, role('admin'))

// Dashboard
router.get('/stats', ctrl.getStats)
router.get('/daily-stats', ctrl.getDailyStats)

// Complaints
router.get('/complaints',              ctrl.getComplaints)
router.patch('/complaints/:id/status', ctrl.updateComplaintStatus)

// Appointments
router.get('/appointments',               ctrl.getAppointments)
router.patch('/appointments/:id/status',  ctrl.updateAppointmentStatus)

// Residents
router.get('/residents', ctrl.getResidents)
router.get('/residents/zone-stats', ctrl.getZoneStats)

// Announcements
router.post('/announcements',       ann.create)
router.put('/announcements/:id',    ann.update)
router.delete('/announcements/:id', ann.remove)

// Reports
router.get('/reports',         ctrl.getReports)
router.get('/reports/export',  ctrl.exportReport)

// Activity Log
router.get('/activity-log', actLog.getActivityLog)

// Profile
router.patch('/profile', ctrl.updateProfile)
router.patch('/profile/password', ctrl.changePassword)

// Notifications
router.get('/notifications', ctrl.getNotifications)
router.patch('/notifications/:id/read', ctrl.markNotificationRead)
router.delete('/notifications', ctrl.clearNotifications)

module.exports = router

