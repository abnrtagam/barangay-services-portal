const router = require('express').Router()
const ctrl   = require('../controllers/complaintController')
const auth   = require('../middleware/authMiddleware')
const role   = require('../middleware/roleMiddleware')
const upload = require('../middleware/uploadMiddleware')

router.get('/categories',        auth, ctrl.getCategories)
router.post('/',   auth, role('resident'), upload.single('attachment'), ctrl.create)

module.exports = router
