const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Action = require('../models/Action');
const User = require('../models/User');
const { checkAndUpdateBadges } = require('../utils/badgeUtils');
const mongoose = require('mongoose');

// Constants for action values
const ACTION_VALUES = {
  'Carpooling': { points: 2, carbonSaved: 2.5 },
  'Reused Container': { points: 1, carbonSaved: 0.5 },
  'Skipped Meat': { points: 2, carbonSaved: 3.0 },
  'Used Public Transport': { points: 1.5, carbonSaved: 1.8 },
  'No-Plastic Day': { points: 1.5, carbonSaved: 1.0 },
  'Custom': { points: 1, carbonSaved: 0.5 }
};

// @route   POST api/actions
// @desc    Log a new eco-action
// @access  Private
router.post('/', [
  auth,
  body('actions').isArray().withMessage('Actions must be an array'),
  body('actions.*.type').isString().isIn(Object.keys(ACTION_VALUES))
    .withMessage('Invalid action type'),
  body('actions.*.notes').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      msg: 'Invalid data', 
      errors: errors.array() 
    });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check for existing actions of each type today
    const { actions } = req.body;
    const actionTypes = actions.map(action => action.type);
    
    const existingActions = await Action.find({
      user: req.user.id,
      type: { $in: actionTypes },
      date: { $gte: today }
    });
    
    const existingTypes = new Set(existingActions.map(action => action.type));
    
    // Filter out action types that already exist today
    const newActions = actions.filter(action => !existingTypes.has(action.type));
    
    if (newActions.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'All specified actions have already been logged today'
      });
    }
    
    // Create action records
    const actionDocs = newActions.map(action => ({
      user: req.user.id,
      type: action.type,
      points: ACTION_VALUES[action.type].points,
      carbonSaved: ACTION_VALUES[action.type].carbonSaved,
      notes: action.notes || '',
      date: new Date()
    }));
    
    const savedActions = await Action.insertMany(actionDocs);
    
    // Update user stats
    const totalPoints = newActions.reduce((sum, action) => 
      sum + ACTION_VALUES[action.type].points, 0);
    
    const totalCarbonSaved = newActions.reduce((sum, action) => 
      sum + ACTION_VALUES[action.type].carbonSaved, 0);
    
    const user = await User.findById(req.user.id);
    
    // Update total points
    user.totalPoints = (user.totalPoints || 0) + totalPoints;
    
    // Update streak
    const lastActionDate = user.lastActionDate ? new Date(user.lastActionDate) : null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    if (!lastActionDate) {
      // First action ever
      user.currentStreak = 1;
      user.longestStreak = 1;
    } else if (lastActionDate >= yesterday) {
      // Action yesterday or today, continue streak
      user.currentStreak = (user.currentStreak || 0) + 1;
      user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
    } else {
      // Streak broken
      user.currentStreak = 1;
    }
    
    user.lastActionDate = new Date();
    await user.save();
    
    // Check and award badges
    const newBadges = await checkAndUpdateBadges(user.id);

    res.json({
      success: true,
      actions: savedActions,
      stats: {
        totalPoints: user.totalPoints,
        totalActionsAdded: savedActions.length,
        currentStreak: user.currentStreak,
        pointsEarned: totalPoints,
        carbonSaved: totalCarbonSaved
      },
      newBadges
    });
  } catch (err) {
    console.error('Error logging actions:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// @route   GET api/actions
// @desc    Get user's action history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = { user: req.user.id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const actions = await Action.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Action.countDocuments(query);
    
    res.json({
      success: true,
      actions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching actions:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// @route   GET api/actions/today
// @desc    Get user's actions for today
// @access  Private
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const actions = await Action.find({
      user: req.user.id,
      date: { $gte: today }
    });
    
    res.json({
      success: true,
      actions,
      completed: actions.map(action => action.type)
    });
  } catch (err) {
    console.error('Error fetching today\'s actions:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// @route   GET api/actions/stats
// @desc    Get user's action statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Get overall statistics
    const actionStats = await Action.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
          _id: null,
          totalActions: { $sum: 1 },
          totalPoints: { $sum: '$points' },
          totalCarbonSaved: { $sum: '$carbonSaved' }
        }
      }
    ]);
    
    // Get today's statistics
    const todayStats = await Action.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: today }
        }
      },
      { $group: {
          _id: null,
          count: { $sum: 1 },
          points: { $sum: '$points' },
          carbonSaved: { $sum: '$carbonSaved' }
        }
      }
    ]);
    
    // Get action counts by type
    const actionsByType = await Action.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
          _id: '$type',
          count: { $sum: 1 },
          points: { $sum: '$points' },
          carbonSaved: { $sum: '$carbonSaved' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get actions by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const dailyActions = await Action.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$date' } 
          },
          count: { $sum: 1 },
          points: { $sum: '$points' },
          carbonSaved: { $sum: '$carbonSaved' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get user data
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      stats: {
        totalActions: actionStats.length > 0 ? actionStats[0].totalActions : 0,
        totalPoints: actionStats.length > 0 ? actionStats[0].totalPoints : 0,
        totalCarbonSaved: actionStats.length > 0 ? actionStats[0].totalCarbonSaved : 0,
        actionsByType,
        dailyActions,
        streak: {
          current: user.currentStreak || 0,
          longest: user.longestStreak || 0
        }
      }
    });
  } catch (err) {
    console.error('Error fetching action stats:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router; 