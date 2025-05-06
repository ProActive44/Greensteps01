import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import LogActions from './components/actions/LogActions';
import ActionHistory from './components/actions/ActionHistory';
import ProgressTracker from './components/progress/ProgressTracker';
import './App.css'

const APP_NAME = import.meta.env.VITE_APP_NAME || 'GreenSteps';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
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
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
    </div>;
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
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
          <Route
            path="/log-action"
            element={
              <ProtectedRoute>
                <LogActions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/action-history"
            element={
              <ProtectedRoute>
                <ActionHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProgressTracker />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
