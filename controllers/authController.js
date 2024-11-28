const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

exports.signup = catchAsync(async (req, resp, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: new Date(),
  });

  const token = signToken(newUser._id);

  resp.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, resp, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if the user exists && password is correct
  //+password -> gets the password... Password was disabled in the schema by using select: false
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.validatePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) if everything is ok, send token to client
  const token = signToken(user._id);
  resp.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it's there
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }

  const token = req.headers.authorization.split(' ')[1];

  // 2) Verification token (this throw and Exception if fails to verify)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Invalid token', 401));
  }

  // 4) Check if user changed password after the JWT Token was issue
  if (currentUser.checkUserPassword(decoded.iat)) {
    return next(new AppError('Invalid token. Please login again', 401));
  }

  req.user = currentUser;
  next();
});
