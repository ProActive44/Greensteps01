/**
 * Calculates streak information based on action dates
 * @param {Date|null} lastActionDate The date of the last recorded action
 * @param {number} currentStreak The current streak count
 * @param {number} longestStreak The longest streak recorded
 * @returns {Object} Updated streak information
 */
const calculateStreak = (
  lastActionDate,
  currentStreak = 0,
  longestStreak = 0
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // If there's no previous action, this is the first action
  if (!lastActionDate) {
    return {
      currentStreak: 1,
      longestStreak: 1,
    };
  }

  // Convert lastActionDate to start of day for comparison
  const lastActionDay = new Date(lastActionDate);
  lastActionDay.setHours(0, 0, 0, 0);

  // Check if the last action was logged today
  if (lastActionDay.getTime() === today.getTime()) {
    // Already logged action today, streak remains the same
    return {
      currentStreak,
      longestStreak,
    };
  }

  // Check if the last action was yesterday (continuing the streak)
  if (lastActionDay.getTime() === yesterday.getTime()) {
    const updatedStreak = currentStreak + 1;
    return {
      currentStreak: updatedStreak,
      longestStreak: Math.max(longestStreak, updatedStreak),
    };
  }

  // Streak is broken (more than one day since last action)
  return {
    currentStreak: 1, // Start a new streak
    longestStreak, // Keep the longest streak record
  };
};

module.exports = { calculateStreak };
