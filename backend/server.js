require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middleware ---
// Production-ready CORS setup
// Normalize FRONTEND_URL: trim and strip surrounding quotes if present
let FRONTEND_URL = process.env.FRONTEND_URL;
if (typeof FRONTEND_URL === 'string') {
  FRONTEND_URL = FRONTEND_URL.trim().replace(/^"|"$/g, '');
}
if (!FRONTEND_URL) {
  console.warn("WARNING: FRONTEND_URL is not set. For production, this should be the URL of your deployed frontend. Development will allow all origins.");
}
const corsOptions = {
  origin: FRONTEND_URL || undefined, // this will be your Firebase Hosting URL in production
};
// Enable CORS. If FRONTEND_URL is not set, it allows all origins (for local development).
app.use(cors(FRONTEND_URL ? corsOptions : undefined));

// Helpful startup logging
console.log(`CORS origin: ${FRONTEND_URL || 'allow-all (development)'}`);


// Parse incoming JSON bodies
app.use(express.json());

// --- Database Connection ---
let MONGO_URI = process.env.MONGO_URI;
if (typeof MONGO_URI === 'string') {
  MONGO_URI = MONGO_URI.trim().replace(/^"|"$/g, '');
}
if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in your .env file.');
  process.exit(1);
}

// Log a masked version of the URI for debugging (don't print credentials)
try {
  const masked = MONGO_URI.replace(/:\/\/.+@/, '://<credentials>@');
  console.log('Attempting MongoDB connection to', masked);
} catch (_) {}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  });


// --- API Routes ---
app.use('/api/leaderboard', require('./routes/leaderboard'));

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});