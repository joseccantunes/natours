const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');
const {
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
  getAllReviews,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);
router
  .route('/:id')
  .get(getReview)
  .patch(updateReview)
  .delete(protect, restrictTo('admin'), deleteReview);

module.exports = router;
