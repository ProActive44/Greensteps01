const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Action = require("../models/Action");
const User = require("../models/User");
const { checkAndUpdateBadges } = require("../utils/badgeUtils");
const { calculateStreak } = require("../utils/streakUtils");
const mongoose = require("mongoose");

// Constants for action values
const ACTION_VALUES = {
  Carpooling: { points: 2, carbonSaved: 2.5 },
  "Reused Container": { points: 1, carbonSaved: 0.5 },
  "Skipped Meat": { points: 2, carbonSaved: 3.0 },
  "Used Public Transport": { points: 1.5, carbonSaved: 1.8 },
  "No-Plastic Day": { points: 1.5, carbonSaved: 1.0 },
  Custom: { points: 1, carbonSaved: 0.5 },
};

// @route   POST api/actions
// @desc    Log a new eco-action
// @access  Private
router.post(
  "/",
  [
    auth,
    body("actions").isArray().withMessage("Actions must be an array"),
    body("actions.*.type")
      .isString()
      .isIn(Object.keys(ACTION_VALUES))
      .withMessage("Invalid action type"),
    body("actions.*.notes").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Invalid data",
        errors: errors.array(),
      });
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get actions from request
      const { actions } = req.body;

      // Separate custom actions from standard actions
      const customActions = actions.filter(
        (action) => action.type === "Custom"
      );
      const standardActions = actions.filter(
        (action) => action.type !== "Custom"
      );

      // For standard actions, check if they've already been logged today
      if (standardActions.length > 0) {
        const standardActionTypes = standardActions.map(
          (action) => action.type
        );

        const existingActions = await Action.find({
          user: req.user.id,
          type: { $in: standardActionTypes },
          date: { $gte: today },
        });

        const existingTypes = new Set(
          existingActions.map((action) => action.type)
        );

        // Filter out standard action types that already exist today
        const newStandardActions = standardActions.filter(
          (action) => !existingTypes.has(action.type)
        );

        // Check if there are no valid standard actions and no custom actions
        if (newStandardActions.length === 0 && customActions.length === 0) {
          return res.status(400).json({
            success: false,
            msg: "All specified non-custom actions have already been logged today",
          });
        }

        // Combine valid standard actions with all custom actions
        const validActions = [...newStandardActions, ...customActions];

        // Create action records for all valid actions
        const actionDocs = validActions.map((action) => ({
          user: req.user.id,
          type: action.type,
          points: ACTION_VALUES[action.type].points,
          carbonSaved: ACTION_VALUES[action.type].carbonSaved,
          notes: action.notes || "",
          date: new Date(),
        }));

        const savedActions = await Action.insertMany(actionDocs);

        // Update user stats
        const totalPoints = validActions.reduce(
          (sum, action) => sum + ACTION_VALUES[action.type].points,
          0
        );

        const totalCarbonSaved = validActions.reduce(
          (sum, action) => sum + ACTION_VALUES[action.type].carbonSaved,
          0
        );

        const user = await User.findById(req.user.id);

        // Update total points
        user.totalPoints = (user.totalPoints || 0) + totalPoints;

        // Update streak using the utility function
        const streakInfo = calculateStreak(
          user.lastActionDate,
          user.currentStreak || 0,
          user.longestStreak || 0
        );
        
        user.currentStreak = streakInfo.currentStreak;
        user.longestStreak = streakInfo.longestStreak;
        user.lastActionDate = new Date();
        
        await user.save();

        // Check and award badges
        const newBadges = await checkAndUpdateBadges(req.user.id);

        // After successfully saving the action, update community stats
        // Get the io instance
        const io = req.app.get("io");

        // Broadcast the action to all connected clients in the community room
        if (io) {
          // Get updated community stats
          const totalUsers = await User.countDocuments();

          const actionStats = await Action.aggregate([
            {
              $group: {
                _id: null,
                totalActions: { $sum: 1 },
                totalCarbonSaved: { $sum: "$carbonSaved" },
              },
            },
          ]);

          const actionsByType = await Action.aggregate([
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
                carbonSaved: { $sum: "$carbonSaved" },
              },
            },
            { $sort: { count: -1 } },
          ]);

          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          const weeklyActions = await Action.countDocuments({
            date: { $gte: oneWeekAgo },
          });

          // Format the stats for broadcasting
          const totalStats = actionStats[0] || {
            totalActions: 0,
            totalCarbonSaved: 0,
          };
          const mostPopularHabit =
            actionsByType.length > 0 ? actionsByType[0]._id : "N/A";

          // Get updated leaderboard
          const topUsers = await User.find()
            .select("username totalPoints currentStreak")
            .sort({ totalPoints: -1 })
            .limit(10);

          const leaderboard = topUsers.map((user, index) => ({
            username: user.username,
            points: user.totalPoints,
            streak: user.currentStreak,
            rank: index + 1,
          }));

          // Broadcast the updated stats
          io.to("community").emit("community-stats-updated", {
            stats: {
              totalUsers,
              totalActions: totalStats.totalActions,
              totalCarbonSaved: totalStats.totalCarbonSaved,
              actionsByType: actionsByType.map((type) => ({
                name: type._id,
                count: type.count,
                carbonSaved: type.carbonSaved,
              })),
              weekly: {
                actionsThisWeek: weeklyActions,
                mostPopularHabit,
              },
            },
            leaderboard,
          });
        }

        res.json({
          success: true,
          actions: savedActions,
          newBadges,
          stats: {
            totalPoints: user.totalPoints,
            totalActionsAdded: savedActions.length,
            currentStreak: user.currentStreak,
            pointsEarned: totalPoints,
            carbonSaved: totalCarbonSaved,
          },
        });
      } else {
        // Only custom actions, no need to check for duplicates
        const actionDocs = customActions.map((action) => ({
          user: req.user.id,
          type: action.type,
          points: ACTION_VALUES[action.type].points,
          carbonSaved: ACTION_VALUES[action.type].carbonSaved,
          notes: action.notes || "",
          date: new Date(),
        }));

        const savedActions = await Action.insertMany(actionDocs);

        // Update user stats
        const totalPoints = customActions.reduce(
          (sum, action) => sum + ACTION_VALUES[action.type].points,
          0
        );

        const totalCarbonSaved = customActions.reduce(
          (sum, action) => sum + ACTION_VALUES[action.type].carbonSaved,
          0
        );

        const user = await User.findById(req.user.id);

        // Update total points
        user.totalPoints = (user.totalPoints || 0) + totalPoints;

        // Update streak using the utility function - same as above
        const streakInfo = calculateStreak(
          user.lastActionDate,
          user.currentStreak || 0,
          user.longestStreak || 0
        );
        
        user.currentStreak = streakInfo.currentStreak;
        user.longestStreak = streakInfo.longestStreak;
        user.lastActionDate = new Date();
        
        await user.save();

        // Check and award badges
        const newBadges = await checkAndUpdateBadges(req.user.id);

        // After successfully saving the action, update community stats
        // Get the io instance
        const io = req.app.get("io");

        // Broadcast the action to all connected clients in the community room
        if (io) {
          // Get updated community stats
          const totalUsers = await User.countDocuments();

          const actionStats = await Action.aggregate([
            {
              $group: {
                _id: null,
                totalActions: { $sum: 1 },
                totalCarbonSaved: { $sum: "$carbonSaved" },
              },
            },
          ]);

          const actionsByType = await Action.aggregate([
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
                carbonSaved: { $sum: "$carbonSaved" },
              },
            },
            { $sort: { count: -1 } },
          ]);

          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          const weeklyActions = await Action.countDocuments({
            date: { $gte: oneWeekAgo },
          });

          // Format the stats for broadcasting
          const totalStats = actionStats[0] || {
            totalActions: 0,
            totalCarbonSaved: 0,
          };
          const mostPopularHabit =
            actionsByType.length > 0 ? actionsByType[0]._id : "N/A";

          // Get updated leaderboard
          const topUsers = await User.find()
            .select("username totalPoints currentStreak")
            .sort({ totalPoints: -1 })
            .limit(10);

          const leaderboard = topUsers.map((user, index) => ({
            username: user.username,
            points: user.totalPoints,
            streak: user.currentStreak,
            rank: index + 1,
          }));

          // Broadcast the updated stats
          io.to("community").emit("community-stats-updated", {
            stats: {
              totalUsers,
              totalActions: totalStats.totalActions,
              totalCarbonSaved: totalStats.totalCarbonSaved,
              actionsByType: actionsByType.map((type) => ({
                name: type._id,
                count: type.count,
                carbonSaved: type.carbonSaved,
              })),
              weekly: {
                actionsThisWeek: weeklyActions,
                mostPopularHabit,
              },
            },
            leaderboard,
          });
        }

        res.json({
          success: true,
          actions: savedActions,
          newBadges,
          stats: {
            totalPoints: user.totalPoints,
            totalActionsAdded: savedActions.length,
            currentStreak: user.currentStreak,
            pointsEarned: totalPoints,
            carbonSaved: totalCarbonSaved,
          },
        });
      }
    } catch (err) {
      console.error("Error logging actions:", err);
      res.status(500).json({ success: false, msg: "Server error" });
    }
  }
);

// @route   GET api/actions
// @desc    Get user's action history
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
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
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching actions:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// @route   GET api/actions/today
// @desc    Get user's actions for today
// @access  Private
router.get("/today", auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const actions = await Action.find({
      user: req.user.id,
      date: { $gte: today },
    });

    res.json({
      success: true,
      actions,
      completed: actions.map((action) => action.type),
    });
  } catch (err) {
    console.error("Error fetching today's actions:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// @route   GET api/actions/stats
// @desc    Get user's action statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
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
      {
        $group: {
          _id: null,
          totalActions: { $sum: 1 },
          totalPoints: { $sum: "$points" },
          totalCarbonSaved: { $sum: "$carbonSaved" },
        },
      },
    ]);

    // Get today's statistics
    const todayStats = await Action.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          points: { $sum: "$points" },
          carbonSaved: { $sum: "$carbonSaved" },
        },
      },
    ]);

    // Get action counts by type
    const actionsByType = await Action.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          points: { $sum: "$points" },
          carbonSaved: { $sum: "$carbonSaved" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get actions by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyActions = await Action.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          count: { $sum: 1 },
          points: { $sum: "$points" },
          carbonSaved: { $sum: "$carbonSaved" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get user data
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      stats: {
        totalActions: actionStats.length > 0 ? actionStats[0].totalActions : 0,
        totalPoints: actionStats.length > 0 ? actionStats[0].totalPoints : 0,
        totalCarbonSaved:
          actionStats.length > 0 ? actionStats[0].totalCarbonSaved : 0,
        actionsByType,
        dailyActions,
        streak: {
          current: user.currentStreak || 0,
          longest: user.longestStreak || 0,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching action stats:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;