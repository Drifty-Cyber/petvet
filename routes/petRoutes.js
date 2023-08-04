const express = require('express');
const petController = require('../controllers/petController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Creating a nested endpoint where logged in users can create reviews on tours
// router
//   .route('/:petId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router.use('/:petId/reviews', reviewRouter);

// SPECIAL ROUTES
router
  .route('/top-5-heavy-pets')
  .get(petController.aliasSmallPets, petController.getAllPets);
router.route('/cheap-pets').get(petController.getCheapPets);
router.route('/expensive-pets').get(petController.getExpensivePets);

// ROUTES
router
  .route('/')
  .get(petController.getAllPets)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'vet-doctor'),
    petController.createPet
  );
router
  .route('/:id')
  .get(petController.getPet)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'vet-doctor'),
    petController.uploadPetImages,
    petController.resizePetImages,
    petController.updatePet
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'vet-doctor'),
    petController.deletePet
  );

// Export Router
module.exports = router;
