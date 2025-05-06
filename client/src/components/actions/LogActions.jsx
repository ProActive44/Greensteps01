import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

const LogActions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    action: '',
    description: '',
    impact: 'low', // low, medium, high
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      toast.success('Action logged successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log action. Please try again.');
      console.error('Error logging action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Log Your Eco-Action</h1>
          <p className="mt-2 text-sm text-gray-600">
            Record your daily eco-friendly activities to track your impact
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="action"
              name="action"
              label="What did you do?"
              placeholder="e.g., Used public transport"
              value={formData.action}
              onChange={handleChange}
              required
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add more details about your action..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="impact" className="block text-sm font-medium text-gray-700 mb-1">
                Environmental Impact
              </label>
              <select
                id="impact"
                name="impact"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                value={formData.impact}
                onChange={handleChange}
              >
                <option value="low">Low Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="high">High Impact</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                Log Action
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogActions; 