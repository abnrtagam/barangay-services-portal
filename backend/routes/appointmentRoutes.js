const router = require('express').Router()
const ctrl   = require('../controllers/appointmentController')
const auth   = require('../middleware/authMiddleware')
const role   = require('../middleware/roleMiddleware')

router.get('/taken-slots', auth, ctrl.getTakenSlots)
router.post('/', auth, role('resident'), ctrl.create)

module.exports = router
