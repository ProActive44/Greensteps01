const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Action = require('../models/Action');
const mongoose = require('mongoose');

// @route   GET api/community/stats
// @desc    Get community-wide statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // Get overall stats
    const totalUsers = await User.countDocuments();
    
    const actionStats = await Action.aggregate([
      { $group: {
          _id: null,
          totalActions: { $sum: 1 },
          totalCarbonSaved: { $sum: '$carbonSaved' }
        }
      }
    ]);
    
    // Get action counts by type
    const actionsByType = await Action.aggregate([
      { $group: {
          _id: '$type',
          count: { $sum: 1 },
          carbonSaved: { $sum: '$carbonSaved' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get actions this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyActions = await Action.countDocuments({ 
      date: { $gte: oneWeekAgo } 
    });
    
    // Format the response
    const totalStats = actionStats[0] || { totalActions: 0, totalCarbonSaved: 0 };
    const mostPopularHabit = actionsByType.length > 0 ? actionsByType[0]._id : 'N/A';
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalActions: totalStats.totalActions,
        totalCarbonSaved: totalStats.totalCarbonSaved,
        actionsByType: actionsByType.map(type => ({
          name: type._id,
          count: type.count,
          carbonSaved: type.carbonSaved
        })),
        weekly: {
          actionsThisWeek: weeklyActions,
          mostPopularHabit
        }
      }
    });
  } catch (err) {
    console.error('Error fetching community stats:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// @route   GET api/community/leaderboard
// @desc    Get top users by points
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topUsers = await User.find()
      .select('username totalPoints currentStreak')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));
    
    // Add rank to each user
    const leaderboard = topUsers.map((user, index) => ({
      username: user.username,
      points: user.totalPoints,
      streak: user.currentStreak,
      rank: index + 1
    }));
    
    res.json({
      success: true,
      leaderboard
    });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router; 