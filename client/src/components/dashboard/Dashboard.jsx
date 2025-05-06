import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
              <span className="text-sm font-medium text-gray-700">Welcome, {user.username}</span>
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
                <span className="text-sm font-medium text-gray-700">Welcome, {user.username}</span>
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
              value={user.ecoPoints} 
              icon={<LeafIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
              trend="up"
              color="primary"
              animate="slide-up"
            />
            <StatsCard 
              title="Current Streak" 
              value={`${user.streak} days`} 
              icon={<FireIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
              trend="up"
              color="amber"
              animate="slide-up"
              delay="delay-100"
            />
            <StatsCard 
              title="Badges Earned" 
              value={user.badges.length} 
              icon={<BadgeIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
              trend="neutral"
              color="indigo"
              animate="slide-up"
              delay="delay-200"
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
                    size="lg"
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Stats card component
const StatsCard = ({ title, value, icon, trend, color, animate, delay }) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      icon: 'text-primary-500',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: 'text-amber-500',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      icon: 'text-indigo-500',
    },
  };

  const trendIcons = {
    up: (
      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
      </svg>
    ),
    down: (
      <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path>
      </svg>
    ),
    neutral: (
      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14"></path>
      </svg>
    ),
  };

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden animate-${animate} ${delay ? delay : ''}`}>
      <div className="p-4">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-1.5 ${colorClasses[color].bg}`}>
            <span className={colorClasses[color].icon}>{icon}</span>
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-base sm:text-lg font-bold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-2">
        <div className="text-xs flex items-center">
          {trendIcons[trend]}
          <span className="ml-1.5 text-gray-500">Since last month</span>
        </div>
      </div>
    </div>
  );
};

// Icons
const LeafIcon = ({ className }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
  </svg>
);

const FireIcon = ({ className }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
  </svg>
);

const BadgeIcon = ({ className }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
  </svg>
);

// Add new icon
const HistoryIcon = ({ className }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

// Add new icon
const ChartIcon = ({ className }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
);

export default Dashboard; 