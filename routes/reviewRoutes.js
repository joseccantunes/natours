const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');
const {
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(protect, restrictTo('user'), setTourUserIds, createReview);
router
  .route('/:id')
  .patch(updateReview)
  .delete(protect, restrictTo('admin'), deleteReview);

module.exports = router;
