const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Badge = require('../models/Badge');
const User = require('../models/User');
const { BADGES } = require('../utils/badgeUtils');

// @route   GET api/badges
// @desc    Get all available badges
// @access  Public
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find().sort({ type: 1, requirement: 1 });
    
    res.json({
      success: true,
      badges
    });
  } catch (err) {
    console.error('Error fetching badges:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// @route   GET api/badges/user
// @desc    Get user's badges with progress
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // Get user with populated badges
    const user = await User.findById(req.user.id).populate('badges');
    
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    // Get all badges
    const allBadges = await Badge.find();
    
    // Create a set of user's badge IDs for quick lookups
    const userBadgeIds = new Set(user.badges.map(badge => badge._id.toString()));
    
    // Add progress information to each badge
    const badgesWithProgress = allBadges.map(badge => {
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
            break;
          case 'milestone':
            badgeInfo.progress = user.totalPoints || 0;
            break;
          case 'category':
            // For category badges, we'll need to calculate progress in the frontend
            // or make a separate query for each badge type, which would be expensive
            badgeInfo.progress = 0; // Placeholder
            break;
        }
      }
      
      return badgeInfo;
    });
    
    res.json({
      success: true,
      badges: badgesWithProgress,
      stats: {
        totalBadges: user.badges.length,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalPoints: user.totalPoints
      }
    });
  } catch (err) {
    console.error('Error fetching user badges:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router; 