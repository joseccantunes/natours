const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Initializing the express application
const app = express();

// 1. MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  // Middleware to log requests
  app.use(morgan('dev'));
}

// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use((req, resp, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2. ROUTE HANDLERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, resp, next) => {
  resp.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`,
  });
  next();
});

module.exports = app;
