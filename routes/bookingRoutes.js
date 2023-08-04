const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protecting all routes
router.use(authController.protect);

// GET "CHECKOUT SESSION" ROUTE
router.get('/checkout-session/:petId', bookingController.getCheckoutSession);

// Restricting routes
router.use(authController.restrictTo('admin', 'lead-guides'));

router
  .route('/')
  .get(authController.protect, bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
