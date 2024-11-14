const fs = require('fs');

// Reading and parsing the tours data from a JSON file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, resp) => {
  resp.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, resp) => {
  const tour = tours.find((el) => el.id === Number(req.params.id));
  if (!tour) {
    resp.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  resp.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tour,
    },
  });
};

exports.createTour = (req, resp) => {
  // Generate a new ID for the tour
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  // Add the new tour to the tours array and save it to the file
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      resp.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, resp) => {
  const tour = tours.find((el) => el.id === Number(req.params.id));

  if (!tour) {
    resp.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  // TODO: Implement tour update logic here

  resp.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

exports.deleteTour = (req, resp) => {
  const tour = tours.find((el) => el.id === Number(req.params.id));

  if (!tour) {
    resp.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  resp.status(204).json({
    status: 'success',
    data: null,
  });
};
