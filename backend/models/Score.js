const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    trim: true,
  },
  score: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Add an index on the score field for faster sorting in queries.
// This is a best practice for production performance.
ScoreSchema.index({ score: -1 });

// Use a toJSON transform to match the frontend's expected 'id' field
// instead of MongoDB's '_id'.
ScoreSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});


module.exports = mongoose.model('Score', ScoreSchema);