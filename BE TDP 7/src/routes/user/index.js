const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');

router.use(verifyToken);

router.use(require('./profile'));
router.use(require('./household'));
router.use(require('./requests'));
router.use(require('./bookings'));
router.use(require('./reports'));
router.use(require('./feedbacks'));
router.use(require('./notifications'));

module.exports = router;
