import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend 
} from 'recharts';
import { actionAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../ui/Button';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

const ImpactDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dailyPoints: 0,
    weeklyPoints: 0,
    totalCarbonSaved: 0,
    dailyData: [],
    habitDistribution: []
  });

  useEffect(() => {
    loadImpactData();
  }, []);

  const loadImpactData = async () => {
    try {
      setLoading(true);
      const response = await actionAPI.getActionStats();
      
      if (response.success) {
        // Transform the API data to the format our charts need
        const dailyData = response.stats.dailyActions.map(day => ({
          date: day._id,
          points: day.points
        }));
        
        const habitDistribution = response.stats.actionsByType.map(type => ({
          habit: type._id,
          count: type.count
        }));
        
        setStats({
          dailyPoints: response.stats.dailyPoints || 0,
          weeklyPoints: response.stats.totalPoints || 0,
          totalCarbonSaved: response.stats.totalCarbonSaved || 0,
          dailyData,
          habitDistribution,
          streak: response.stats.streak || { current: 0, longest: 0 }
        });
      } else {
        toast.error(response.msg || 'Failed to load impact data');
      }
    } catch (error) {
      toast.error('Failed to load impact data');
      console.error(error);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Environmental Impact</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track your eco-friendly actions and their impact on the environment
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/log-action')}
          >
            Log New Action
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Today's Points</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.dailyPoints}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Weekly Points</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.weeklyPoints}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">CO₂ Saved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalCarbonSaved}kg</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Current Streak</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.streak.current} days</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Points Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Points Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyData}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                    name="Eco-Points"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Habits Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Performed Habits</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.habitDistribution}
                    dataKey="count"
                    nameKey="habit"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats.habitDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Impact Tips */}
        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-primary-900 mb-4">💡 Impact Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Your most consistent habit is{' '}
                <span className="font-medium text-primary-600">
                  {stats.habitDistribution.sort((a, b) => b.count - a.count)[0]?.habit}
                </span>
                . Keep it up!
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">
                You've saved the equivalent of{' '}
                <span className="font-medium text-primary-600">
                  {(stats.totalCarbonSaved / 2.5).toFixed(1)} trees
                </span>
                {' '}worth of CO₂ this week!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard; 