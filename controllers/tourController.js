const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeature');
const catchAsync = require('./../utils/catchAsync');

exports.aliasTopTours = (req, resp, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage';
  req.query.fields = 'name,price,reatinsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, resp, next) => {
  //BUILD QUERY
  const feature = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sorting()
    .limitFields()
    .paginate();

  //EXECUTE QUERY
  const tours = await feature.query;

  //SEND RESPONSE
  resp.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, resp, next) => {
  const tour = await Tour.findById(req.params.id);

  resp.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, resp, next) => {
  const newTour = await Tour.create(req.body);

  resp.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, resp, next) => {
  //find, update and return the nupdated document
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  resp.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, resp, next) => {
  await Tour.findByIdAndDelete(req.params.id);

  resp.status(204).json({
    status: 'success',
    data: null,
  });
});

//Aggregation pipeline
exports.getTourStats = catchAsync(async (req, resp, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null, //don't group by any field, group by everything
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  resp.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, resp, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);

  resp.status(200).json({
    status: 'success',
    data: plan,
  });
});
