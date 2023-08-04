const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// router.use(authController.isLoggedIn);

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);

// Get Pet
router.get('/pet/:slug', authController.isLoggedIn, viewController.getPet);

// LOGIN ROUTE
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);

// USER ACCOUNT PAGE
router.get('/me', authController.protect, viewController.getAccount);

// VIEW BOUGHT PETS
router.get('/my-pets', authController.protect, viewController.getMyPets);

module.exports = router;
