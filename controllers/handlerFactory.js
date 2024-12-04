const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.updateOne;
exports.updateTour = catchAsync(async (req, resp, next) => {
  //find, update and return the nupdated document
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  resp.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteOne = (Model) =>
  catchAsync(async (req, resp, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    resp.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, resp, next) => {
    //find, update and return the updated document
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    resp.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, resp, next) => {
    const doc = await Model.create(req.body);

    resp.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
