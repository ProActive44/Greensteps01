import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { actionAPI } from '../../services/api';

// Sample data - in a real app, this would come from an API
const MOCK_ACTIONS = [
  { id: 1, action: 'Used public transport', description: 'Took the bus to work instead of driving', impact: 'medium', date: '2023-06-01' },
  { id: 2, action: 'Reusable water bottle', description: 'Used my own bottle instead of buying plastic', impact: 'low', date: '2023-06-02' },
  { id: 3, action: 'Planted a tree', description: 'Added a new tree to my backyard', impact: 'high', date: '2023-06-03' },
  { id: 4, action: 'Composted food waste', description: 'Started composting kitchen scraps', impact: 'medium', date: '2023-06-04' },
  { id: 5, action: 'Energy efficient lighting', description: 'Replaced all home bulbs with LED', impact: 'medium', date: '2023-06-05' },
];

const ActionHistory = () => {
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        let response = await actionAPI.getActions();
        console.log(response)
        if (response.success) {
          setActions(response.actions || []);
        }
        else {
          toast.error('Failed to load actions');
        }
      } catch (error) {
        console.error('Error fetching actions:', error);
        toast.error('Failed to load your action history');
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, []);

  const getImpactColor = (impact) => {
    switch (impact) {
      case 1:
        return 'bg-green-800 text-green-800';
      case 1.5:
        return 'bg-blue-800 text-blue-800';
      case 2:
        return 'bg-red-800 text-purple-800';
      default:
        return 'bg-gray-800 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Action History</h1>
            <p className="mt-2 text-sm text-gray-600">
              Review all the eco-friendly actions you've taken
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            </div>
          ) : actions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">You haven't logged any actions yet.</p>
              <Button 
                variant="primary"
                className="mt-4"
                onClick={() => navigate('/log-action')}
              >
                Log Your First Action
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {actions.map((action) => (
                    <tr key={action._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(action.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {action.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getImpactColor(action.points)}`}>
                          *
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {action.notes || action.type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <Button 
            variant="primary"
            onClick={() => navigate('/log-action')}
          >
            Log New Action
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionHistory; 