const mongoose = require('mongoose');
const slugify = require('slugify');

// vaccinations, medical history, description, summary
const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A pet must have a name'],
      unique: true,
    },
    id: String,
    breed: {
      type: String,
      required: [true, 'A pet must have a breed'],
    },
    age: {
      type: Number,
      required: [true, 'A pet must have an age'],
    },
    gender: {
      type: String,
      required: [true, 'A pet must have a gender'],
      enum: {
        values: ['Male', 'Female'],
        message: 'Gender is either Male or Female',
      },
    },
    color: String,
    weight: {
      type: Number,
      min: [0, 'Weight must be above 0lbs'],
      max: [150, 'Weight must be less than 150lbs'],
    },
    size: {
      type: String,
    },
    diet: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    imageCover: {
      type: String,
      required: [true, 'A pet must have a cover image'],
    },
    images: [String],
    personality: String,
    vaccinations: [String],
    medical_history: String,
    summary: String,
    description: String,
    medicalHistory: String,
    cost: {
      type: Number,
      required: [true, 'A pet must have a cost'],
    },
    picture: String,
    slug: String,
    doctors: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Single Index
// petSchema.index({ cost: 1 });
// Compound Index
petSchema.index({ cost: 1 });
petSchema.index({ slug: 1 });
petSchema.index({ gender: 'Female' });

// VIRTUAL POPULATING PETS - TO GET REVIEWS DOCUMENT ON PETS
petSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'pet',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE
petSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
// QUERY MIDDLEWARE TO POPULATE 'guides' FIELD WHEN REFERENCING USERS
petSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'doctors',
    select: '-__v -passwordChangedAt',
  });

  next();
});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
