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
    sendErrorProd(err, resp);
  }
};
