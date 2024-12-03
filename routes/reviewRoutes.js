const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
  getReview,
} = require('../controllers/reviewController');

const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);
router.route('/:id').get(getReview);

module.exports = router;
