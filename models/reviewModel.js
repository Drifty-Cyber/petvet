const mongoose = require('mongoose');
const Pet = require('./petModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    pet: {
      type: mongoose.Schema.ObjectId,
      ref: 'Pet',
      required: [true, 'Review must belong to a pet'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// QUERY MIDDLEWARE TO POPULATE REVIEWS
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'pet',
    select: 'name -doctors',
  }).populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// Preventing Duplicate Reviews
reviewSchema.index({ pet: 1, user: 1 }, { unique: true });

// MIDDLEWARE TO CALCULATE "avgRatings" on Pets
// Static Function to calculate the number of ratings and average ratings
reviewSchema.statics.calcAverageRatings = async function (petId) {
  const stats = await this.aggregate([
    {
      $match: { pet: petId },
    },
    {
      $group: {
        _id: '$pet',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    await Pet.findByIdAndUpdate(petId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Pet.findByIdAndUpdate(petId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.pet);
});

// MIDDLEWARE TO CALL 'calcAverageRatings' static function for "update" & "delete" hook
// Passes the document to the second middleware for this to work
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  this.r.constructor.calcAverageRatings(this.r.pet);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
