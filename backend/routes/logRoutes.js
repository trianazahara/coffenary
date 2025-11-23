const router = require('express').Router();
const { LogController } = require('../controllers/LogController');
const LogModel = require('../models/logModel');
const { protect, checkRole } = require('../middleware/authMiddleware');

const log = new LogController({ LogModel });

router.get('/',    protect, checkRole(['admin']), log.semua);
router.delete('/', protect, checkRole(['admin']), log.clear); 

module.exports = router;
