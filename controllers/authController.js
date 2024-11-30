const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const { restrictTo } = require('./tourController');

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
    role: 'admin',
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

exports.restrictTo =
  (...roles) =>
  (req, resp, next) => {
    //roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };

exports.forgotPassword = catchAsync(async (req, resp, next) => {
  // 1) Get user based on POSTed email
  console.log(req.body.email);
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateModifiedOnly: true });
  console.log(resetToken);

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Click the link to reset it: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateModifiedOnly: true });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }

  resp.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});

exports.resetPassword = catchAsync(async (req, resp, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in, send JWT
  const token = signToken(user._id);
  resp.status(200).json({
    status: 'success',
    token,
  });
});
