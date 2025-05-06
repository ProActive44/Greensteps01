import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { communityAPI } from '../../services/api';
import { io } from 'socket.io-client';

const CommunityBoard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
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
    // Initial load of community stats
    loadCommunityStats();
    
    // Set up WebSocket connection
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL);
    
    // Listen for real-time updates
    socketRef.current.on('connect', () => {
      console.log('Connected to community socket');
    });
    
    socketRef.current.on('community-stats-updated', (data) => {
      console.log('Received real-time community update:', data);
      updateStatsFromSocketData(data);
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  const updateStatsFromSocketData = (data) => {
    if (!data) return;
    
    // Prepare the updated stats
    const updatedStats = { ...stats };
    
    if (data.stats) {
      updatedStats.totalActions = data.stats.totalActions || stats.totalActions;
      updatedStats.totalUsers = data.stats.totalUsers || stats.totalUsers;
      updatedStats.totalCarbonSaved = data.stats.totalCarbonSaved || stats.totalCarbonSaved;
      
      if (data.stats.actionsByType) {
        updatedStats.topHabits = data.stats.actionsByType.map(habit => ({
          name: habit.name,
          count: habit.count,
          carbonSaved: habit.carbonSaved
        }));
      }
      
      if (data.stats.weekly) {
        updatedStats.weeklyStats = {
          actionsThisWeek: data.stats.weekly.actionsThisWeek || stats.weeklyStats.actionsThisWeek,
          mostPopularHabit: data.stats.weekly.mostPopularHabit || stats.weeklyStats.mostPopularHabit,
          participationRate: data.stats.weekly.participationRate || stats.weeklyStats.participationRate
        };
      }
    }
    
    if (data.leaderboard) {
      updatedStats.leaderboard = data.leaderboard;
    }
    
    // Update state with new data
    setStats(updatedStats);
    
    // Show toast notification for real-time updates
    toast.success('Community stats updated in real-time!', {
      id: 'community-update',
      duration: 2000
    });
  };

  const loadCommunityStats = async () => {
    try {
      setLoading(true);
      
      // Get community stats
      const statsResponse = await communityAPI.getStats();
      
      // Get leaderboard
      const leaderboardResponse = await communityAPI.getLeaderboard();
      
      if (statsResponse.success && leaderboardResponse.success) {
        // Format the data for our component
        setStats({
          totalActions: statsResponse.stats.totalActions || 0,
          totalUsers: statsResponse.stats.totalUsers || 0,
          totalCarbonSaved: statsResponse.stats.totalCarbonSaved || 0,
          topHabits: statsResponse.stats.actionsByType || [],
          leaderboard: leaderboardResponse.leaderboard || [],
          weeklyStats: {
            actionsThisWeek: statsResponse.stats.weekly?.actionsThisWeek || 0,
            mostPopularHabit: statsResponse.stats.weekly?.mostPopularHabit || 'N/A',
            participationRate: statsResponse.stats.weekly?.participationRate || 0
          }
        });
      } else {
        toast.error('Failed to load community data');
      }
    } catch (error) {
      console.error('Failed to load community statistics:', error);
      toast.error('Failed to load community statistics');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data manually
  const handleRefresh = () => {
    toast.loading('Refreshing community data...', { id: 'refresh' });
    loadCommunityStats().then(() => {
      toast.success('Data refreshed!', { id: 'refresh' });
    });
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Impact</h1>
            <p className="mt-2 text-sm text-gray-600">
              See how our collective actions are making a difference
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={handleRefresh}
            >
              Refresh Data
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Real-time indicator */}
        <div className="mb-6 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center">
          <div className="relative mr-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 left-0 animate-ping"></div>
          </div>
          <p className="text-sm text-green-700">
            Live data - updates in real-time as community members log actions
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