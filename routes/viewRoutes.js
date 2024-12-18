const express = require('express');

const { protect, isLoggedIn } = require('../controllers/authController');
const {
  getAccount,
  getOverview,
  getTour,
  getLoginForm,
  updateUserData,
} = require('../controllers/viewsController');

const router = express.Router();

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/me', protect, getAccount);

router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
