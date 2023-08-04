const Stripe = require('stripe');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Pet = require('../models/petModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get pet from ID provided
  const pet = await Pet.findById(req.params.petId);

  // 2) Create a checkout session
  // A) Create a product
  const product = await stripe.products.create({
    name: `${pet.name}`,
    description: `${pet.description}`,
    images: [
      `https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80`,
    ],
  });

  // B) Create a price
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'USD',
    unit_amount: pet.cost,
  });

  // C) Creating session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?pet=${pet._id}&user=${
      req.user.id
    }&price=${pet.cost}`,
    cancel_url: `${req.protocol}://${req.get('host')}/pet/${pet.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: price.id,
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // 3) Send checkout to user
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { pet, user, price } = req.query;

  if (!pet && !user && !price) {
    return next();
  }

  await Booking.create({ pet, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

// Create a booking
exports.createBooking = factory.createOne(Booking);

// Get All bookings
exports.getAllBookings = factory.getAll(Booking);

// Get a booking
exports.getBooking = factory.getOne(Booking);

// Update a booking
exports.updateBooking = factory.updateOne(Booking);

// Delete a booking
exports.deleteBooking = factory.deleteOne(Booking);
