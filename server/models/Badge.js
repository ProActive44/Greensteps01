const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['streak', 'milestone', 'category'],
    required: true
  },
  requirement: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: function() {
      return this.type === 'category';
    }
  }
});

module.exports = mongoose.model('Badge', badgeSchema); 