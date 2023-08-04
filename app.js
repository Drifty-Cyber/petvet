const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const petRouter = require('./routes/petRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// This API only accepts 50 requests per hour😉
const app = express();

// SETTING UP PUG
app.set('view engine', 'pug');
// SETTING UP THE VIEWS FOLDER FOR MVC
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES
// STATIC FILES RENDERING
app.use(express.static(path.join(__dirname, 'public')));

// Helmet
// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      },
    },
  })
);

// Morgan BUG -- NOT WORKING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(morgan('dev'));

// Rate Limiter
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP. For security reasons, please try again in an hour!',
});
app.use('/api', limiter);

// EXPRESS MIDDLEWARE - Parse body data
app.use(express.json({ limit: '10kb' }));

// Parse form data
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);

// Parse cookies
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

app.use(compression());

//CUSTOM MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/pets', petRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//START ERROR HANDLING FROM BEGINNING
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// EXPORT APP
module.exports = app;
