const express = require('express');
const { getBookings, createBooking, updateStatus, softDeleteBooking, restoreBooking } = require('../controllers/bookingController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticate, getBookings);
router.post('/', authenticate, createBooking);
router.patch('/:id/status', authenticate, updateStatus);
router.delete('/:id', authenticate, softDeleteBooking);
router.patch('/:id/restore', authenticate, restoreBooking);

module.exports = router;
