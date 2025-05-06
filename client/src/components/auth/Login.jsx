import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        setErrors({ form: result.error });
        toast.error(result.error || 'Login failed');
      }
    } catch (err) {
      const errorMessage = 'An error occurred during login. Please try again.';
      setErrors({ form: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-4000"></div>
      </div>

      {/* Header with brand */}
      <header className="z-10 w-full pt-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-primary-600">GreenSteps</h1>
            <p className="text-sm text-gray-600">Make eco-friendly habits part of your daily routine</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="z-10 flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign up
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.form && (
                <div className="rounded-md bg-red-50 p-4 animate-shake">
                  <p className="text-sm text-red-700">{errors.form}</p>
                </div>
              )}
              
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                disabled={loading}
                required
                autoComplete="email"
              />
              
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={loading}
                required
                autoComplete="current-password"
              />
              
              <div className="flex items-center justify-end">
                <Link to="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </Link>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Sign in
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 py-6 text-center text-xs text-gray-500 animate-fade-in">
        <p>© {new Date().getFullYear()} GreenSteps. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login; 