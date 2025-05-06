import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { actionAPI } from '../../services/api';
import PointsCounter from '../ui/PointsCounter';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    ecoPoints: 0,
    streak: 0,
    badgesCount: 0,
    carbonSaved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  // Refresh stats when coming back to the dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        loadUserStats();
      }
    };

    // Add event listener for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add event listener for when the user returns to this page
    window.addEventListener('focus', () => user && loadUserStats());
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => user && loadUserStats());
    };
  }, [user]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      
      // Get the latest stats from the API
      const response = await actionAPI.getActionStats();
      
      if (response.success && response.stats) {
        // Make sure we're accessing the streak data correctly
        const currentStreak = response.stats.streak && response.stats.streak.current 
          ? response.stats.streak.current 
          : 0;
        
        setStats({
          ecoPoints: response.stats.totalPoints || 0,
          // Use the correct streak value
          streak: currentStreak,
          badgesCount: user.badges?.length || 0,
          carbonSaved: response.stats.totalCarbonSaved || 0
        });
        
        console.log('Current streak from API:', currentStreak); // Debug log
      } else {
        // Fallback to user object if API fails
        console.log('Using fallback streak data:', user.currentStreak); // Debug log
        setStats({
          ecoPoints: user.totalPoints || 0,
          streak: user.currentStreak || 0,
          badgesCount: user.badges?.length || 0,
          carbonSaved: user.carbonSaved || 0
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Fallback to user object if API fails
      setStats({
        ecoPoints: user.totalPoints || 0,
        streak: user.currentStreak || 0,
        badgesCount: user.badges?.length || 0,
        carbonSaved: user.carbonSaved || 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">GreenSteps</h1>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex md:items-center md:space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {/* {console.log(user)} */}
                Welcome, {user.username || 'User'}
              </span>
              <div className="h-4 w-px bg-gray-300"></div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                Logout
              </Button>
            </nav>
            
            {/* Mobile menu button - only visible on small screens */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {menuOpen ? (
                  <svg className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu - collapsible and only visible on small screens */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 animate-slide-down">
            <div className="pt-2 pb-3 space-y-1 px-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {user.username || user.name || 'User'}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard 
              title="Eco Points" 
              value={stats.ecoPoints} 
              previousValue={stats.ecoPoints} 
              icon={<LeafIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
              trend="up"
              color="primary"
              animate="slide-up"
              delay="delay-100"
              loading={loading}
            />
            <StatsCard 
              title="Current Streak" 
              value={`${stats.streak}`} 
              previousValue={stats.streak} 
              icon={<FireIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
              trend="up"
              color="amber"
              animate="slide-up"
              delay="delay-100"
              loading={loading}
            />
            <StatsCard 
              title="Badges Earned" 
              value={stats.badgesCount} 
              previousValue={stats.badgesCount} 
              icon={<BadgeIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
              trend="neutral"
              color="indigo"
              animate="slide-up"
              delay="delay-200"
              loading={loading}
            />
          </div>

          {/* Content area */}
          <div className="bg-gray-50 shadow rounded-lg p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Your Environmental Impact Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Log actions card */}
              <div className="p-4 sm:p-8 flex flex-col items-center justify-center text-center bg-white rounded-lg">
                <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4 z-0">
                  <LeafIcon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Ready to log your eco-habits?</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  Start logging your daily eco-friendly actions to track your impact and earn rewards.
                </p>
                <div className="mt-6 relative z-50">
                  <Button 
                    onClick={() => navigate('/log-action')}
                    variant="primary"
                    className="shadow-lg font-bold text-white cursor-pointer"
                    size="lg"
                  >
                    Log Today's Actions
                  </Button>
                </div>
              </div>
              
              {/* View history card */}
              <div className="p-4 sm:p-8 flex flex-col items-center justify-center text-center bg-white rounded-lg">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4 z-0">
                  <HistoryIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">View Your Action History</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  Review your past eco-friendly actions and track your progress over time.
                </p>
                <div className="mt-6 relative z-50">
                  <Button 
                    onClick={() => navigate('/action-history')}
                    variant="outline"
                    className="shadow-lg cursor-pointer"
                  >
                    View History
                  </Button>
                </div>
              </div>
              
              {/* View progress card */}
              <div className="p-4 sm:p-8 flex flex-col items-center justify-center text-center bg-white rounded-lg">
                <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4 z-0">
                  <ChartIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Track Your Progress</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  See your environmental impact and track your progress with detailed analytics.
                </p>
                <div className="mt-6 relative z-50">
                  <Button 
                    onClick={() => navigate('/progress')}
                    variant="outline"
                    className="shadow-lg cursor-pointer"
                    size="lg"
                  >
                    View Progress
                  </Button>
                </div>
              </div>

              {/* View impact card */}
              <div className="p-4 sm:p-8 flex flex-col items-center justify-center text-center bg-white rounded-lg">
                <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
                  <ChartIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">View Your Impact</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  See how your eco-friendly actions are making a difference
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate('/impact')}
                    variant="outline"
                    className="shadow-lg"
                  >
                    View Impact
                  </Button>
                </div>
              </div>

              {/* View achievements card */}
              <div className="p-4 sm:p-8 flex flex-col items-center justify-center text-center bg-white rounded-lg">
                <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-full mb-4">
                  <BadgeIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">View Achievements</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  Check your badges and current streaks
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate('/achievements')}
                    variant="outline"
                    className="shadow-lg"
                  >
                    View Achievements
                  </Button>
                </div>
              </div>

              {/* Community impact card */}
              <div className="p-4 sm:p-8 flex flex-col items-center justify-center text-center bg-white rounded-lg">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                  <CommunityIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Community Impact</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  See how our community is making a difference together
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate('/community')}
                    variant="outline"
                    className="shadow-lg"
                  >
                    View Community
                  </Button>
                </div>
              </div>

              {/* Impact Journal card */}
              <div className="p-4 sm:p-8 flex flex-col items-center justify-center text-center bg-white rounded-lg">
                <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
                  <JournalIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Impact Journal</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  Review your eco-friendly journey and daily reflections
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate('/journal')}
                    variant="outline"
                    className="shadow-lg"
                  >
                    View Journal
                  </Button>
                </div>
              </div>
            </div>

            {/* Carbon Impact Summary */}
            {stats.carbonSaved > 0 && (
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-green-800">Your Positive Impact</h3>
                    <p className="text-green-700">
                      You've saved approximately <span className="font-bold">{stats.carbonSaved} kg</span> of CO₂ emissions. 
                      That's equivalent to planting <span className="font-bold">{Math.round(stats.carbonSaved / 2.5)} trees</span>!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Stats card component
const StatsCard = ({ title, value, previousValue, icon, trend, color, animate, delay, loading }) => {
  const colors = {
    primary: 'text-primary-600 bg-primary-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    amber: 'text-amber-600 bg-amber-100',
    indigo: 'text-indigo-600 bg-indigo-100'
  };

  const trends = {
    up: (
      <div className="flex items-center text-green-600 text-xs font-medium">
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span>Increasing</span>
      </div>
    ),
    down: (
      <div className="flex items-center text-red-600 text-xs font-medium">
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span>Decreasing</span>
      </div>
    ),
    neutral: (
      <div className="flex items-center text-gray-500 text-xs font-medium">
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
        <span>Steady</span>
      </div>
    )
  };

  const animations = {
    'slide-up': 'animate-slide-up',
    'slide-down': 'animate-slide-down',
    'fade-in': 'animate-fade-in',
    'none': ''
  };

  const delays = {
    'delay-100': 'delay-100',
    'delay-200': 'delay-200',
    'delay-300': 'delay-300',
    'none': ''
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${animations[animate] || ''} ${delay ? delays[delay] : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`p-1.5 rounded-full ${colors[color] || colors.primary}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? (
              <PointsCounter value={value} previousValue={previousValue || 0} />
            ) : (
              value
            )}
          </p>
          {trend && trends[trend]}
        </div>
      )}
    </div>
  );
};

// Icons
const LeafIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const FireIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);

const BadgeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const HistoryIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CommunityIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const JournalIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
);

export default Dashboard; 