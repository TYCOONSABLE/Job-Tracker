// ============================================================
// server.js - THE MAIN ENTRY POINT OF YOUR BACKEND
// ============================================================
// Think of this file as the "front door" of your server.
// It sets everything up and starts listening for requests.
// ============================================================

// Load environment variables from .env file FIRST
// (so other files can use process.env.MONGO_URI etc.)
require('dotenv').config();

const express = require('express');  // Express = web framework
const cors = require('cors');        // CORS = lets your React app talk to this server
const mongoose = require('mongoose'); // Mongoose = talks to MongoDB
const cron = require('node-cron');   // Cron = runs tasks on a schedule

// Import our route files (we'll create these next)
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

// Import email reminder utility
const { sendDailyReminders } = require('./utils/emailReminder');

// ============================================================
// CREATE THE EXPRESS APP
// ============================================================
const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================
// Middleware = functions that run on EVERY request before
// it reaches your route handlers. Like a security checkpoint.

// Allow requests from your React frontend (localhost:5173 in dev)
app.use(cors({
  origin: [
    'http://localhost:5173',         // React dev server
    process.env.FRONTEND_URL         // Production URL (set in .env)
  ].filter(Boolean),                 // filter(Boolean) removes undefined values
  credentials: true                  // Allow cookies/auth headers
}));

// Parse incoming JSON - without this, req.body would be undefined
// When React sends { email: 'test@test.com' }, this turns it into a JS object
app.use(express.json());

// ============================================================
// ROUTES
// ============================================================
// Attach our route files to specific URL prefixes
// Any request to /api/auth/... → goes to authRoutes
// Any request to /api/jobs/... → goes to jobRoutes

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// A simple test route - visit http://localhost:5000/api/health
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running! 🚀',
    time: new Date().toISOString()
  });
});

// ============================================================
// CONNECT TO MONGODB
// ============================================================
// mongoose.connect() returns a Promise (async operation)
// .then() runs when connection succeeds
// .catch() runs when connection fails

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Exit the process if DB connection fails
  });

// ============================================================
// SCHEDULE EMAIL REMINDERS
// ============================================================
// node-cron uses "cron syntax": '0 9 * * *' = "At 9:00 AM every day"
// Format: minute hour day-of-month month day-of-week
// '0 9 * * *' = minute:0, hour:9, every day, every month, every weekday

cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running daily email reminders...');
  await sendDailyReminders();
});

// ============================================================
// START LISTENING
// ============================================================
// process.env.PORT = the port from .env file (5000)
// || 5000 = fallback if not set

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API health check: http://localhost:${PORT}/api/health`);
});
