import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'GreenSteps';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Redirect if authenticated
const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
    </div>;
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
};

// Dashboard component (placeholder for now)
const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-green-600">{APP_NAME}</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user.username}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p>Eco Points: {user.ecoPoints}</p>
            <p>Current Streak: {user.streak} days</p>
            <p>Badges: {user.badges.length}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#f3f4f6',
              color: '#1f2937',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
        <Routes>
          <Route 
            path="/login" 
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            } 
          />
          <Route 
            path="/register" 
            element={
              <RedirectIfAuthenticated>
                <Register />
              </RedirectIfAuthenticated>
            } 
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
