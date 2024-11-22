const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeature');

exports.aliasTopTours = (req, resp, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage';
  req.query.fields = 'name,price,reatinsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, resp) => {
  try {
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
  } catch (err) {
    console.log(err);
    resp.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, resp) => {
  try {
    const tour = await Tour.findById(req.params.id);

    resp.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    resp.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, resp) => {
  try {
    //const newTour = new Tour({});
    //newTour.save();
    const newTour = await Tour.create(req.body);

    resp.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    resp.status(400).json({
      status: 'fail',
      message: err,
    });
  }

  // // Generate a new ID for the tour
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // // Add the new tour to the tours array and save it to the file
  // tours.push(newTour);
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     resp.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour,
  //       },
  //     });
  //   },
  // );
};

exports.updateTour = async (req, resp) => {
  try {
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
  } catch (err) {
    resp.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.deleteTour = async (req, resp) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    resp.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    resp.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

//Aggregation pipeline
exports.getTourStats = async (req, resp) => {
  try {
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
  } catch (err) {
    resp.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, resp) => {
  try {
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
  } catch (err) {
    resp.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
