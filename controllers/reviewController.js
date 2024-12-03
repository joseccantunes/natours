const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, resp) => {
  const reviews = await Review.find();
  resp.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, resp) => {
  const newReview = await Review.create(req.body);

  resp.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.getReview = catchAsync(async (req, resp) => {
  const review = await Review.findById(req.params.id);

  resp.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});
