const Booking = require('../models/bookingModel');
const Pet = require('../models/petModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get pet data
  // 2) build template
  // 3) render template
  const pets = await Pet.find();
  res.status(200).render('overview', {
    title: 'All Pets',
    pets,
  });
});

exports.getPet = catchAsync(async (req, res, next) => {
  const pet = await Pet.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating',
  });

  if (!pet) {
    return next(new AppError('There is no pet with that name', 404));
  }

  res.status(200).render('pet', {
    title: 'Pet Detail page',
    pet,
  });
});

exports.getMyPets = catchAsync(async (req, res, next) => {
  // 1) Get all bookings made by user
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Get pet IDs from bookings
  const petIDs = bookings.map((el) => el.pet);

  // 3) Find pets with IDs in the above array
  const pets = await Pet.find({ _id: { $in: petIDs } });

  // 4) Render pets with account tomorrow
  res.status(200).render('overview', {
    title: 'Your Purchases',
    pets,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log in to your account',
  });
});

exports.getSignupForm = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Log in to your account',
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};
