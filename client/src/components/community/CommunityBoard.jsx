import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CommunityBoard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActions: 0,
    totalUsers: 0,
    totalCarbonSaved: 0,
    topHabits: [],
    leaderboard: [],
    weeklyStats: {
      actionsThisWeek: 0,
      mostPopularHabit: '',
      participationRate: 0
    }
  });

  useEffect(() => {
    loadCommunityStats();
  }, []);

  const loadCommunityStats = async () => {
    try {
      // TODO: Replace with actual API call
      const mockData = {
        totalActions: 1547,
        totalUsers: 234,
        totalCarbonSaved: 2890,
        topHabits: [
          { name: 'Public Transport', count: 423, carbonSaved: 846 },
          { name: 'No-Plastic Day', count: 389, carbonSaved: 389 },
          { name: 'Skipped Meat', count: 356, carbonSaved: 1068 },
          { name: 'Carpooling', count: 245, carbonSaved: 490 },
          { name: 'Reused Container', count: 134, carbonSaved: 97 }
        ],
        leaderboard: [
          { username: 'EcoWarrior', points: 856, rank: 1, streak: 15 },
          { username: 'GreenHero', points: 742, rank: 2, streak: 12 },
          { username: 'EarthGuardian', points: 695, rank: 3, streak: 8 },
          { username: 'PlanetSaver', points: 634, rank: 4, streak: 10 },
          { username: 'EcoChampion', points: 589, rank: 5, streak: 7 },
          { username: 'GreenNinja', points: 567, rank: 6, streak: 9 },
          { username: 'EarthAngel', points: 543, rank: 7, streak: 6 },
          { username: 'EcoExplorer', points: 521, rank: 8, streak: 5 },
          { username: 'GreenKeeper', points: 498, rank: 9, streak: 4 },
          { username: 'PlanetHero', points: 476, rank: 10, streak: 3 }
        ],
        weeklyStats: {
          actionsThisWeek: 287,
          mostPopularHabit: 'Public Transport',
          participationRate: 78
        }
      };

      setStats(mockData);
    } catch (error) {
      toast.error('Failed to load community statistics');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Impact</h1>
          <p className="mt-2 text-sm text-gray-600">
            See how our community is making a difference together
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {stats.totalActions.toLocaleString()}
            </div>
            <h3 className="text-sm font-medium text-gray-500">Total Actions Logged</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.totalCarbonSaved.toLocaleString()}kg
            </div>
            <h3 className="text-sm font-medium text-gray-500">CO₂ Saved Together</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.totalUsers.toLocaleString()}
            </div>
            <h3 className="text-sm font-medium text-gray-500">Active Members</h3>
          </div>
        </div>

        {/* Weekly Highlights */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-primary-900 mb-6">This Week's Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {stats.weeklyStats.actionsThisWeek}
              </div>
              <p className="text-sm text-gray-600">Actions This Week</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {stats.weeklyStats.mostPopularHabit}
              </div>
              <p className="text-sm text-gray-600">Most Popular Habit</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {stats.weeklyStats.participationRate}%
              </div>
              <p className="text-sm text-gray-600">Community Participation</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Habits */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Most Popular Habits</h2>
              <div className="space-y-4">
                {stats.topHabits.map((habit, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getHabitIcon(habit.name)}</span>
                        <span className="font-medium text-gray-900">{habit.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {habit.carbonSaved}kg CO₂ saved
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-primary-600">{habit.count}</div>
                      <div className="text-sm text-gray-500">times</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Contributors</h2>
              <div className="space-y-4">
                {stats.leaderboard.map((user, index) => (
                  <div 
                    key={index}
                    className={`
                      flex items-center p-3 rounded-lg
                      ${index < 3 ? 'bg-primary-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex-shrink-0 w-8">
                      <span className={`
                        font-bold
                        ${index === 0 ? 'text-yellow-500' : ''}
                        ${index === 1 ? 'text-gray-400' : ''}
                        ${index === 2 ? 'text-yellow-700' : ''}
                      `}>
                        #{user.rank}
                      </span>
                    </div>
                    <div className="flex-1 ml-3">
                      <div className="font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">
                        {user.streak} day streak
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-primary-600">
                        {user.points.toLocaleString()} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get emoji icons for habits
const getHabitIcon = (habitName) => {
  const icons = {
    'Carpooling': '🚗',
    'Reused Container': '♻️',
    'Skipped Meat': '🥗',
    'Used Public Transport': '🚌',
    'No-Plastic Day': '🌱',
    'Custom': '🌍'
  };
  return icons[habitName] || '🌍';
};

export default CommunityBoard; 