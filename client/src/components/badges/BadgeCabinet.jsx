import { useState, useEffect } from 'react';
import { badgeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const BadgeCabinet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    totalBadges: 0
  });
  const [badges, setBadges] = useState([]);
  
  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const response = await badgeAPI.getUserBadges();
      
      if (response.success) {
        setBadges(response.badges || []);
        setStats(response.stats || {
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0,
          totalBadges: 0
        });
      } else {
        toast.error(response.msg || 'Failed to load badges');
      }
    } catch (error) {
      toast.error('Failed to load achievements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Group badges by type
  const streakBadges = badges.filter(badge => badge.type === 'streak');
  const milestoneBadges = badges.filter(badge => badge.type === 'milestone');
  const categoryBadges = badges.filter(badge => badge.type === 'category');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Achievement Cabinet</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track your progress and unlock achievements as you build eco-friendly habits
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/log-action')}
            >
              Log New Action
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Current Streak</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.currentStreak} {stats.currentStreak > 1 ? "days" : "day"}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Longest Streak</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.longestStreak} {stats.longestStreak > 1 ? "days" : "day"}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Total Badges</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalBadges}</p>
          </div>
        </div>

        {/* Streak Badges */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Streak Achievements</h2>
          {streakBadges.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">
                No streak badges earned yet. Start building your streak by logging actions daily!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streakBadges.map(badge => (
                <BadgeCard
                  key={badge.badgeId}
                  badge={badge}
                  progress={stats.currentStreak}
                />
              ))}
            </div>
          )}
        </div>

        {/* Milestone Badges */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Milestone Achievements</h2>
          {milestoneBadges.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">
                No milestone badges earned yet. Keep logging actions to earn points!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestoneBadges.map(badge => (
                <BadgeCard
                  key={badge.badgeId}
                  badge={badge}
                  progress={stats.totalPoints}
                />
              ))}
            </div>
          )}
        </div>

        {/* Category Badges */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Achievements</h2>
          {categoryBadges.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">
                No category badges earned yet. Try focusing on specific eco-actions!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryBadges.map(badge => (
                <BadgeCard
                  key={badge.badgeId}
                  badge={badge}
                  progress={badge.progress}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BadgeCard = ({ badge, progress }) => {
  const progressPercentage = badge.isUnlocked 
    ? 100 
    : progress !== undefined 
      ? Math.min((progress / badge.requirement) * 100, 100) 
      : 0;

  return (
    <div className={`
      relative bg-white rounded-lg shadow-md p-6 transition-all
      ${badge.isUnlocked ? 'border-2 border-primary-500' : 'border border-gray-200'}
    `}>
      <div className="flex items-center space-x-4">
        <div className={`
          text-3xl p-2 rounded-full
          ${badge.isUnlocked ? 'bg-primary-100' : 'bg-gray-100'}
        `}>
          {badge.icon}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{badge.name}</h3>
          <p className="text-sm text-gray-500">{badge.description}</p>
        </div>
      </div>

      {/* Progress bar */}
      {!badge.isUnlocked && progress !== undefined && badge.requirement > 0 && (
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-primary-600">
                  Progress
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold inline-block text-primary-600">
                  {progress}/{badge.requirement}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-primary-100">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      )}

      {badge.isUnlocked && (
        <div className="absolute top-2 right-2">
          <span className="text-primary-500">✓</span>
        </div>
      )}
    </div>
  );
};

export default BadgeCabinet; 