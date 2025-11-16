// routes/logRoutes.js
const router = require('express').Router();
const { Log } = require('../controllers/Log');
const LogModel = require('../models/logModel');
const { protect, checkRole } = require('../middleware/authMiddleware');

const log = new Log({ LogModel });

router.get('/', protect, checkRole(['admin']), log.semua);

module.exports = router;
