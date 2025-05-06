const User = require('../models/User');
const Badge = require('../models/Badge');
const Action = require('../models/Action');
const mongoose = require('mongoose');

// Badge definitions
const BADGES = {
  STREAKS: [
    {
      badgeId: 'streak-3',
      name: '3-Day Warrior',
      description: 'Logged actions for 3 days in a row',
      icon: '🌱',
      type: 'streak',
      requirement: 3
    },
    {
      badgeId: 'streak-7',
      name: 'Week Champion',
      description: 'Maintained a 7-day streak',
      icon: '🌿',
      type: 'streak',
      requirement: 7
    },
    {
      badgeId: 'streak-30',
      name: 'Earth Guardian',
      description: 'Incredible 30-day streak',
      icon: '🌳',
      type: 'streak',
      requirement: 30
    }
  ],
  MILESTONES: [
    {
      badgeId: 'points-100',
      name: 'Century Club',
      description: 'Earned 100 eco-points',
      icon: '🎯',
      type: 'milestone',
      requirement: 100
    },
    {
      badgeId: 'points-500',
      name: 'Impact Master',
      description: 'Earned 500 eco-points',
      icon: '🏆',
      type: 'milestone',
      requirement: 500
    },
    {
      badgeId: 'points-1000',
      name: 'Planet Protector',
      description: 'Earned 1000 eco-points',
      icon: '🌍',
      type: 'milestone',
      requirement: 1000
    }
  ],
  CATEGORY: [
    {
      badgeId: 'transport-10',
      name: 'Transit Pro',
      description: 'Used eco-friendly transport 10 times',
      icon: '🚌',
      type: 'category',
      category: 'Used Public Transport',
      requirement: 10
    },
    {
      badgeId: 'waste-15',
      name: 'Zero Waste Hero',
      description: 'Completed 15 no-plastic days',
      icon: '♻️',
      type: 'category',
      category: 'No-Plastic Day',
      requirement: 15
    },
    {
      badgeId: 'food-20',
      name: 'Sustainable Foodie',
      description: 'Logged 20 meat-free days',
      icon: '🥗',
      type: 'category',
      category: 'Skipped Meat',
      requirement: 20
    }
  ]
};

// Initialize badges in the database
const initializeBadges = async () => {
  try {
    const allBadges = [
      ...BADGES.STREAKS,
      ...BADGES.MILESTONES,
      ...BADGES.CATEGORY
    ];
    
    for (const badge of allBadges) {
      // Use badgeId as a unique identifier but don't set it as _id
      const exists = await Badge.findOne({ badgeId: badge.badgeId });
      
      if (!exists) {
        await Badge.create(badge);
        console.log(`Created badge: ${badge.name}`);
      }
    }
    
    console.log('Badges initialized successfully');
  } catch (error) {
    console.error('Error initializing badges:', error);
  }
};

// Check and award badges to a user
const checkAndUpdateBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];
    
    const newBadges = [];
    
    // Get all user's current badges
    const userBadgeIds = user.badges.map(badge => 
      badge instanceof mongoose.Types.ObjectId ? badge.toString() : badge
    );
    
    // Get all badges from database
    const allBadges = await Badge.find();
    
    // Check streak badges
    const streakBadges = allBadges.filter(badge => badge.type === 'streak');
    for (const badge of streakBadges) {
      if (!userBadgeIds.includes(badge._id.toString()) && user.currentStreak >= badge.requirement) {
        user.badges.push(badge._id);
        newBadges.push(badge);
      }
    }
    
    // Check milestone badges
    const milestoneBadges = allBadges.filter(badge => badge.type === 'milestone');
    for (const badge of milestoneBadges) {
      if (!userBadgeIds.includes(badge._id.toString()) && user.totalPoints >= badge.requirement) {
        user.badges.push(badge._id);
        newBadges.push(badge);
      }
    }
    
    // Check category badges
    const categoryBadges = allBadges.filter(badge => badge.type === 'category');
    for (const badge of categoryBadges) {
      // Count actions of this category type
      const actionCount = await Action.countDocuments({
        user: userId,
        type: badge.category
      });
      
      if (!userBadgeIds.includes(badge._id.toString()) && actionCount >= badge.requirement) {
        user.badges.push(badge._id);
        newBadges.push(badge);
      }
    }
    
    if (newBadges.length > 0) {
      await user.save();
    }
    
    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
};

module.exports = {
  initializeBadges,
  checkAndUpdateBadges,
  BADGES
};