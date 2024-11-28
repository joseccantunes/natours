const AppError = require('../utils/appError');

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path} is ${err.value}`;
  return new AppError(message, 400);
}

function handleDuplicatedFieldsDB(err) {
  console.log(err);
  const message = `Duplicated ${Object.keys(err.keyValue)[0]} value "${Object.values(err.keyValue)[0]}". Please use another value.`;
  return new AppError(message, 400);
}

function handleJWTError() {
  return new AppError('Invalid token. Please log in again!', 401);
}

function handleJWTExpiredError() {
  return new AppError('Your token has expired! Please log in again!', 401);
}

function handleValidationErrorDB(err) {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid imput data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}

function sendErrorDev(err, resp) {
  resp.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

function sendErrorProd(err, resp) {
  // Operation, trusted error: send message to client
  if (err.isOperational) {
    resp.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Progamming or other unkonwn error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    resp.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
}

module.exports = (err, req, resp, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, resp);
  } else {
    let error = Object.assign(err);
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicatedFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, resp);
  }
};
