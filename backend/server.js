require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middleware ---
// Production-ready CORS setup
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  console.warn("WARNING: FRONTEND_URL is not set. For production, this should be the URL of your deployed frontend.");
}
const corsOptions = {
  origin: FRONTEND_URL, // This will be your Firebase Hosting URL in production
};
// Enable CORS. If FRONTEND_URL is not set, it allows all origins (for local development).
// If it is set, it will only allow requests from that origin.
app.use(cors(FRONTEND_URL ? corsOptions : undefined));


// Parse incoming JSON bodies
app.use(express.json());

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in your .env file.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


// --- API Routes ---
app.use('/api/leaderboard', require('./routes/leaderboard'));

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});