const router = require('express').Router()
const ctrl   = require('../controllers/announcementController')
const auth   = require('../middleware/authMiddleware')

router.get('/', auth, ctrl.getAll)

module.exports = router
