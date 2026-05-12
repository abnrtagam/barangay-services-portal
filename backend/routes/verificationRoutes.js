const router = require('express').Router()
const ctrl   = require('../controllers/verificationController')
const auth   = require('../middleware/authMiddleware')
const role   = require('../middleware/roleMiddleware')

// All routes require admin authentication
router.use(auth, role('admin'))

// Get verification statistics
router.get('/stats', ctrl.getVerificationStats)

// Get all accounts with filtering
router.get('/', ctrl.getAllAccounts)

// Get pending accounts only
router.get('/pending', ctrl.getPendingAccounts)

// Get reactivation requests
router.get('/reactivation-requests', ctrl.getReactivationRequests)

// Get account details
router.get('/:id', ctrl.getAccountDetails)

// Account actions
router.post('/:id/approve', ctrl.approveAccount)
router.post('/:id/reject', ctrl.rejectAccount)
router.post('/:id/suspend', ctrl.suspendAccount)
router.post('/:id/reactivate', ctrl.reactivateAccount)

module.exports = router
