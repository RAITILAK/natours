const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Set security HTTP headers
app.use(helmet());

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://cdnjs.cloudflare.com/',
  'https://*.stripe.com/',
  'https://js.stripe.com/',
  'https://unpkg.com', // Include Leaflet script URL
];
const styleSrcUrls = ['https://fonts.googleapis.com/', 'https://unpkg.com'];
const connectSrcUrls = [
  'https://bundle.js:*',
  'ws://127.0.0.1:*/',
  'https://unpkg.com', // Include Leaflet connect URL
  'https://tile.openstreetmap.org',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// Set security http headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com/',
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
        'ws://127.0.0.1:49968/',
      ],
      // scriptSrc: ["'self'", ...scriptSrcUrls],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        ...scriptSrcUrls,
        'https://unpkg.com', // Allow scripts from unpkg.com for Leaflet
        'https://cdnjs.cloudflare.com', // Allow scripts from cdnjs.cloudflare.com for Leaflet // Allow scripts from api.mapbox.com
      ],
      // styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      frameSrc: ["'self'", 'https://*.stripe.com'],
      objectSrc: [],
      // imgSrc: ["'self'", 'blob:', 'data:', 'https://unpkg.com'],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://unpkg.com', // Allow images from unpkg.com for Leaflet
        'https://a.tile.openstreetmap.org', // Allow images from a.tile.openstreetmap.org
        'https://b.tile.openstreetmap.org', // Allow images from b.tile.openstreetmap.org
        'https://c.tile.openstreetmap.org', // Allow images from c.tile.openstreetmap.org
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP,please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
