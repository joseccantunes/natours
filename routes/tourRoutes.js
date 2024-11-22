const express = require('express');
const {
  getAllTours,
  aliasTopTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  // checkID,
} = require('../controllers/tourController');

const router = express.Router();

//use of middleware aliasTopTours
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
