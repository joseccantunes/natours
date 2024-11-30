const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const { forgotPassword } = require('./authController');

function filteredObj(obj, ...allowedFields) {
  const newObj = {};

  //filter out fields that are present in the allowedFields array
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
}

exports.getAllUsers = catchAsync(async (req, resp) => {
  const users = await User.find();
  resp.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, resp, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
        400,
      ),
    );
  }

  // 2) Update user document
  const user = await User.findById(req.user.id);
  user.name = 'Jonas';

  const filteredBody = filteredObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, //return the updated document
    runValidators: true,
  });

  resp.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, resp, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  resp.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, resp) => {
  resp.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.getUser = (req, resp) => {
  resp.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = (req, resp) => {
  resp.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.deleteUser = (req, resp) => {
  resp.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
