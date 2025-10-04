const express = require('express');
const router = express.Router();
const { checkout } = require('../controllers/checkoutController');
// jika perlu auth: const { protect } = require('../middleware/authMiddleware');

router.post('/', checkout);

module.exports = router;
