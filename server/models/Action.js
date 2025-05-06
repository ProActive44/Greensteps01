const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Carpooling', 'Reused Container', 'Skipped Meat', 'Used Public Transport', 'No-Plastic Day', 'Custom', 'Reflection']
  },
  points: {
    type: Number,
    required: true
  },
  carbonSaved: {
    type: Number,
    required: true
  },
  notes: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
actionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Action', actionSchema); 