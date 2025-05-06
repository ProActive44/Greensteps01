const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Action = require('../models/Action');
const User = require('../models/User');
const Badge = require('../models/Badge');
const mongoose = require('mongoose');

// @route   GET api/progress
// @desc    Get user's complete progress data
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get user data
    const user = await User.findById(req.user.id).populate('badges');
    
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    // Get all stats in one request
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
    
    // Get monthly data for current year
    const currentYear = new Date().getFullYear();
    const monthlyData = await Action.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { 
            $gte: new Date(`${currentYear}-01-01`), 
            $lt: new Date(`${currentYear + 1}-01-01`) 
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          month: { $first: { $month: '$date' } },
          count: { $sum: 1 },
          points: { $sum: '$points' },
          carbonSaved: { $sum: '$carbonSaved' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const progressByMonth = monthlyData.map(item => ({
      month: months[item.month - 1],
      actions: item.count,
      points: item.points,
      carbonSaved: item.carbonSaved
    }));
    
    // Get badges
    const badges = await Badge.find();
    const userBadgeIds = new Set(user.badges.map(badge => badge._id.toString()));
    
    const badgesWithProgress = badges.map(badge => {
      const isUnlocked = userBadgeIds.has(badge._id.toString());
      const badgeInfo = {
        ...badge.toObject(),
        isUnlocked
      };
      
      // Add progress based on badge type
      if (!isUnlocked) {
        switch (badge.type) {
          case 'streak':
            badgeInfo.progress = user.currentStreak || 0;
            badgeInfo.target = badge.requirement || 7;
            break;
          case 'milestone':
            badgeInfo.progress = user.totalPoints || 0;
            badgeInfo.target = badge.requirement || 100;
            break;
          case 'category':
            // Find action type that matches this badge
            const matchingAction = actionsByType.find(a => 
              a._id.toLowerCase().includes(badge.category.toLowerCase()));
            badgeInfo.progress = matchingAction ? matchingAction.count : 0;
            badgeInfo.target = badge.requirement || 10;
            break;
        }
      }
      
      return badgeInfo;
    });
    
    // Map action types to categories
    const categoryMap = {
      'Carpooling': 'Transportation',
      'Used Public Transport': 'Transportation',
      'Reused Container': 'Waste',
      'No-Plastic Day': 'Waste',
      'Skipped Meat': 'Food'
    };
    
    // Process category impact
    const categoryData = {};
    actionsByType.forEach(action => {
      const category = categoryMap[action._id] || 'Other';
      
      if (!categoryData[category]) {
        categoryData[category] = { category, count: 0, points: 0, carbonSaved: 0 };
      }
      
      categoryData[category].count += action.count;
      categoryData[category].points += action.points;
      categoryData[category].carbonSaved += action.carbonSaved;
    });
    
    res.json({
      success: true,
      totalPoints: actionStats.length > 0 ? actionStats[0].totalPoints : 0,
      totalActions: actionStats.length > 0 ? actionStats[0].totalActions : 0,
      totalCarbonSaved: actionStats.length > 0 ? actionStats[0].totalCarbonSaved : 0,
      streak: {
        current: user.currentStreak || 0,
        longest: user.longestStreak || 0
      },
      progressByMonth,
      impactByCategory: Object.values(categoryData),
      badges: badgesWithProgress
    });
  } catch (err) {
    console.error(`Error in progress API (${req.path}):`, err);
    // Return a more detailed error message in development
    const errorMsg = process.env.NODE_ENV === 'production' 
      ? 'Server error' 
      : err.message || 'Server error';
    
    res.status(500).json({ 
      success: false, 
      msg: errorMsg
    });
  }
});

// @route   GET api/progress/monthly
// @desc    Get monthly progress data for a specific year
// @access  Private
router.get('/monthly', auth, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    // Get monthly data
    const monthlyData = await Action.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { 
            $gte: new Date(`${year}-01-01`), 
            $lt: new Date(`${year + 1}-01-01`) 
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          month: { $first: { $month: '$date' } },
          count: { $sum: 1 },
          points: { $sum: '$points' },
          carbonSaved: { $sum: '$carbonSaved' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const progressByMonth = monthlyData.map(item => ({
      month: months[item.month - 1],
      actions: item.count,
      points: item.points,
      carbonSaved: item.carbonSaved
    }));
    
    res.json({
      success: true,
      year,
      progressByMonth
    });
  } catch (err) {
    console.error('Error fetching monthly progress:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router; 