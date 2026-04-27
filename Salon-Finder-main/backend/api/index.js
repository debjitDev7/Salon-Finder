const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const errorHandler = require('../middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Mount routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/salons', require('../routes/salons'));
app.use('/api/slots', require('../routes/slots'));
app.use('/api/bookings', require('../routes/bookings'));
app.use('/api/admin', require('../routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Salon Finder API' });
});

// Error handler middleware
app.use(errorHandler);

// Export for Vercel serverless
module.exports = app;
