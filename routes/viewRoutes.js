const express = require('express');

const { protect, isLoggedIn } = require('../controllers/authController');
const {
  getAccount,
  getOverview,
  getTour,
  getLoginForm,
  updateUserData,
  getMyTours,
} = require('../controllers/viewsController');

const router = express.Router();

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);

router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
