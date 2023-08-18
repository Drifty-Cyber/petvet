const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const Pet = require('../models/petModel');
// const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPetImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizePetImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  // UPLOAD TO CLOUDINARY
  const result = await cloudinary.uploader.upload(req.files.buffer);

  // 1) Process "imageCover"
  // PUTTING "imageCover" on request body so it can be updated
  req.body.imageCover = `pet-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Process every other image
  await Promise.all(
    req.files.images.map(async (file, i) => {
      req.body.images = [];
      const filename = `pet-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      // Pushing filenames into images array so it can be updated with body
      req.body.images.push(filename);
    })
  );

  res.json(result);

  next();
});

exports.aliasSmallPets = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-size,cost';
  req.query.fields = 'name,cost,size,gender,personality';

  next();
};

exports.getAllPets = factory.getAll(Pet);

exports.getPet = factory.getOne(Pet, { path: 'reviews' });

exports.createPet = factory.createOne(Pet);

exports.updatePet = factory.updateOne(Pet);

exports.deletePet = factory.deleteOne(Pet);
// exports.deletePet = catchAsync(async (req, res, next) => {
//   const pet = await Pet.findByIdAndDelete(req.params.id);

//   if (!pet) {
//     return next(new AppError('No Pet found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// SPECIAL ROUTES: AGGREGATION PIPELINE
exports.getExpensivePets = catchAsync(async (req, res, next) => {
  const pet = await Pet.aggregate([
    {
      $match: { cost: { $gte: 500 } },
    },
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Pets that cost above 500$',
    data: {
      pet,
    },
  });
});

// IMPLEMENT SPECIAL ROUTES, USE AGGREGATION PIPELINE, REFACTOR THE API FEATURES (SORT, LIMIT, ETC)
exports.getCheapPets = catchAsync(async (req, res, next) => {
  const cheapPets = await Pet.aggregate([
    {
      $match: { cost: { $lte: 500 } },
    },
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Pets that cost less than 500$',
    data: {
      cheapPets,
    },
  });
});
