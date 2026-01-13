const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../../middleware/auth');

router.use(verifyToken);
router.use(isAdmin);

router.use(require('./users'));
router.use(require('./households'));
router.use(require('./residents'));
router.use(require('./dashboard'));
router.use(require('./requests'));
router.use(require('./facilities'));
router.use(require('./bookings'));
router.use(require('./feedbacks'));
router.use(require('./reports'));
router.use(require('./notifications'));

module.exports = router;
