import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { progressAPI } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ProgressTracker = () => {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // Get progress data
      const response = await progressAPI.getProgressData();
      
      if (response.success) {
        // Use empty arrays for data that might be missing
        const emptyProgressByMonth = [];
        const emptyImpactByCategory = [];
        const emptyBadges = [];
        
        setProgressData({
          totalPoints: response.totalPoints || 0,
          actionsCompleted: response.totalActions || 0,
          co2Saved: response.totalCarbonSaved || 0,
          progressByMonth: Array.isArray(response.progressByMonth) ? response.progressByMonth : emptyProgressByMonth,
          impactByCategory: Array.isArray(response.impactByCategory) ? response.impactByCategory : emptyImpactByCategory,
          badges: Array.isArray(response.badges) ? response.badges.map(badge => ({
            id: badge._id || badge.id,
            name: badge.name,
            description: badge.description,
            earned: badge.isUnlocked,
            date: badge.earnedDate || badge.date || badge.createdAt || new Date().toISOString(),
            icon: badge.icon,
            progress: badge.progress,
            target: badge.target || badge.requirement
          })) : emptyBadges
        });
      } else {
        console.log(response)
        toast.error('Failed to load progress data');
      }
      
      // Get category impact for pie chart
      // const categoryResponse = await progressAPI.getCategoryImpact();
      // if (categoryResponse.success) {
      //   setPieData(categoryResponse.mostPerformedActions || []);
      // }
      
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast.error('Failed to load your progress data');
    } finally {
      setLoading(false);
    }
  };

  // Simple bar chart component
  const BarChart = ({ data, labelKey, valueKey, maxValue, colorClass = 'bg-primary-500' }) => {
    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-500">{item[labelKey]}</div>
            <div className="flex-1">
              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 bottom-0 ${colorClass} transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min((item[valueKey] / (maxValue || 1)) * 100, 100)}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-end px-3">
                  <span className="text-xs font-medium">{item[valueKey]}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // For pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Environmental Impact</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track your progress and see your positive impact on the environment
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-8">
              <div className="sm:hidden">
                <select
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                >
                  <option value="overview">Overview</option>
                  <option value="history">Monthly Progress</option>
                  <option value="categories">Impact by Category</option>
                  <option value="badges">Badges & Achievements</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {['overview', 'history', 'categories', 'badges'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                          whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                          ${activeTab === tab 
                            ? 'border-primary-500 text-primary-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white shadow rounded-lg">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Impact at a Glance</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-4xl font-bold text-primary-600">{progressData.totalPoints}</div>
                      <div className="text-sm text-gray-500 mt-2">Total Eco Points</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-4xl font-bold text-green-600">{progressData.actionsCompleted}</div>
                      <div className="text-sm text-gray-500 mt-2">Actions Completed</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-4xl font-bold text-blue-600">{progressData.co2Saved} kg</div>
                      <div className="text-sm text-gray-500 mt-2">CO2 Emissions Saved</div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Achievements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {progressData.badges.filter(badge => badge.earned).slice(0, 2).map(badge => (
                        <div key={badge.id} className="border border-green-100 bg-green-50 rounded-lg p-4 flex items-center">
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">{badge.name}</h4>
                            <p className="text-xs text-gray-500">{badge.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Earned on {new Date(badge.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Monthly Progress Tab */}
              {activeTab === 'history' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Progress</h2>
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Eco Points by Month</h3>
                    {progressData.progressByMonth && progressData.progressByMonth.length > 0 ? (
                      <BarChart 
                        data={progressData.progressByMonth} 
                        labelKey="month" 
                        valueKey="points" 
                        maxValue={Math.max(...progressData.progressByMonth.map(d => d.points || 0), 1)}
                        colorClass="bg-primary-500"
                      />
                    ) : (
                      <div className="py-12 text-center text-gray-500">
                        <p>No data available yet. Start logging your eco-actions to see your progress!</p>
                        <Button
                          variant="primary"
                          className="mt-6"
                          onClick={() => navigate('/log-action')}
                        >
                          Log Your First Action
                        </Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Actions by Month</h3>
                    <BarChart 
                      data={progressData.progressByMonth} 
                      labelKey="month" 
                      valueKey="actions" 
                      maxValue={Math.max(...progressData.progressByMonth.map(d => d.actions))}
                      colorClass="bg-green-500"
                    />
                  </div>
                </div>
              )}

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Impact by Category</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Actions by Category</h3>
                      <BarChart 
                        data={progressData.impactByCategory} 
                        labelKey="category" 
                        valueKey="count" 
                        maxValue={Math.max(...progressData.impactByCategory.map(d => d.count))}
                        colorClass="bg-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Points by Category</h3>
                      <BarChart 
                        data={progressData.impactByCategory} 
                        labelKey="category" 
                        valueKey="points" 
                        maxValue={Math.max(...progressData.impactByCategory.map(d => d.points))}
                        colorClass="bg-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Badges Tab */}
              {activeTab === 'badges' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Badges & Achievements</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {progressData.badges.map(badge => (
                      <div 
                        key={badge.id} 
                        className={`border rounded-lg p-4 flex items-center ${
                          badge.earned ? 'border-green-100 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          badge.earned ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          {badge.earned ? (
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : (
                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">{badge.name}</h4>
                          <p className="text-xs text-gray-500">{badge.description}</p>
                          {badge.earned ? (
                            <p className="text-xs text-gray-400 mt-1">Earned on {new Date(badge.date).toLocaleDateString()}</p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-1">Not yet earned</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker; 