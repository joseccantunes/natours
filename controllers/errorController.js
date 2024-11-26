const AppError = require('../utils/appError');

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path} is ${err.value}`;
  return new AppError(message, 400);
}

function handleDuplicatedFieldsDB(err) {
  const message = `Duplicated field value "${err.keyValue.name}". Please use another value.`;
  return new AppError(message, 400);
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
    console.log(err);
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicatedFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    sendErrorProd(error, resp);
  }
};
