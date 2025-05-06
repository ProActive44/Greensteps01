const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Action = require('../models/Action');
const mongoose = require('mongoose');

// @route   GET api/journal
// @desc    Get user's action journal with date-based grouping
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get actions grouped by date
    const entriesByDate = await Action.aggregate([
      // Match actions for this user - use new mongoose.Types.ObjectId()
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      
      // Add formatted date field for grouping
      { $addFields: {
          dateString: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
        }
      },
      
      // Sort newest first
      { $sort: { date: -1 } },
      
      // Group by date
      { $group: {
          _id: '$dateString',
          date: { $first: '$dateString' },
          actions: { $push: '$$ROOT' },
          totalPoints: { $sum: '$points' },
          totalCarbonSaved: { $sum: '$carbonSaved' },
          actionCount: { $sum: 1 }
        }
      },
      
      // Sort again by date (groups)
      { $sort: { _id: -1 } },
      
      // Apply pagination
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
    
    // Get total entry count
    const totalCount = await Action.aggregate([
      // Fix here too
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $addFields: {
          dateString: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
        }
      },
      { $group: { _id: '$dateString' } },
      { $count: 'total' }
    ]);
    
    const total = totalCount.length > 0 ? totalCount[0].total : 0;
    
    // Get lifetime stats
    const lifetimeStats = await Action.aggregate([
      // Fix here too
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
          _id: null,
          totalPoints: { $sum: '$points' },
          totalCarbonSaved: { $sum: '$carbonSaved' },
          totalActions: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      entries: entriesByDate,
      stats: lifetimeStats.length > 0 ? lifetimeStats[0] : { totalPoints: 0, totalCarbonSaved: 0, totalActions: 0 },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching journal:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// @route   GET api/journal/:date
// @desc    Get detailed actions for a specific date
// @access  Private
router.get('/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, msg: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // Create date range for the requested day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Find actions for this date
    const actions = await Action.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Calculate totals
    const totalPoints = actions.reduce((sum, action) => sum + action.points, 0);
    const totalCarbonSaved = actions.reduce((sum, action) => sum + action.carbonSaved, 0);
    
    res.json({
      success: true,
      date,
      actions,
      stats: {
        totalPoints,
        totalCarbonSaved,
        actionCount: actions.length
      }
    });
  } catch (err) {
    console.error('Error fetching date detail:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// @route   POST api/journal/:date/reflection
// @desc    Add or update reflection for a date
// @access  Private
router.post('/:date/reflection', [
  auth,
], async (req, res) => {
  try {
    const { date } = req.params;
    const { reflection } = req.body;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, msg: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // For now, we'll store reflections as a special type of action
    // In a real app, you might want a separate model for reflections
    
    // Create date range for the requested day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Check if a reflection already exists
    const existingReflection = await Action.findOne({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate },
      type: 'Reflection'
    });
    
    if (existingReflection) {
      // Update existing reflection
      existingReflection.notes = reflection;
      await existingReflection.save();
      
      res.json({
        success: true,
        reflection: existingReflection
      });
    } else {
      // Create new reflection
      const newReflection = new Action({
        user: req.user.id,
        type: 'Reflection',
        notes: reflection,
        points: 0, // No points for reflections
        carbonSaved: 0,
        date: new Date(date) // Use noon of the selected date
      });
      
      await newReflection.save();
      
      res.json({
        success: true,
        reflection: newReflection
      });
    }
  } catch (err) {
    console.error('Error saving reflection:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router; 