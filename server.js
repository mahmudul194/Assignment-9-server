require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const requestRoutes = require('./routes/requests');

const app = express();

// CORS configuration - support cookies across origins (client and server)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // Allow in development
        if (process.env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        console.error(`CORS REJECTED! Request Origin: '${origin}'. Allowed Origins:`, allowedOrigins);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser
app.use(cookieParser());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/requests', requestRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Pet Adoption API is running...' });
});

// Custom 404 Route handler for APIs
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start server FIRST, then connect to DB in background
// This ensures the server responds immediately even if MongoDB is slow
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  connectDB();
});
