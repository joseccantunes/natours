const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');

// Initializing the express application
const app = express();

// 1. GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  // Middleware to log requests
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //1h
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

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
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 400));
});

app.use(globalErrorHandler);

module.exports = app;
