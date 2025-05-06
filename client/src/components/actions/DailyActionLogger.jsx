import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ECO_ACTIONS } from '../../constants/ecoActions';
import { actionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DailyActionLogger = () => {
  const navigate = useNavigate();
  const [selectedActions, setSelectedActions] = useState(new Set());
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [todaysActions, setTodaysActions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTodaysActions();
  }, []);

  const loadTodaysActions = async () => {
    try {
      setLoading(true);
      const response = await actionAPI.getTodaysActions();
      
      if (response.success) {
        setTodaysActions(response.actions || []);
      } else {
        toast.error('Failed to load today\'s actions');
      }
    } catch (error) {
      toast.error('Failed to load today\'s actions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionToggle = (actionId) => {
    const newSelected = new Set(selectedActions);
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId);
      const newNotes = { ...notes };
      delete newNotes[actionId];
      setNotes(newNotes);
    } else {
      newSelected.add(actionId);
    }
    setSelectedActions(newSelected);
  };

  const handleNotesChange = (actionId, value) => {
    setNotes(prev => ({
      ...prev,
      [actionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedActions.size === 0 && !notes.custom) {
        toast.error('Please select at least one action');
        return;
      }
      
      setIsSubmitting(true);
      
      // Prepare actions for submission
      const actions = Array.from(selectedActions).map(actionId => {
        const ecoAction = ECO_ACTIONS.find(action => action.id === actionId);
        return {
          type: ecoAction.name,
          notes: notes[actionId] || ''
        };
      });
      
      if (notes.custom && notes.custom.trim()) {
        actions.push({
          type: 'Custom',
          notes: notes.custom
        });
      }
      
      const response = await actionAPI.logActions(actions);
      
      if (response.success) {
        toast.success(`${response.actions.length} actions logged successfully!`);
        
        // Show points earned
        if (response.stats && response.stats.pointsEarned > 0) {
          toast.success(`You earned ${response.stats.pointsEarned} eco-points!`);
        }
        
        // Show streak achievement
        if (response.stats && response.stats.currentStreak > 1) {
          toast.success(`Current streak: ${response.stats.currentStreak} days!`);
        }
        
        // Show newly earned badges
        if (response.newBadges && response.newBadges.length > 0) {
          response.newBadges.forEach(badge => {
            toast.success(`🏆 New badge: ${badge.name}!`);
          });
        }
        
        navigate('/');
      } else {
        toast.error(response.msg || 'Failed to log actions');
      }
    } catch (error) {
      toast.error('Failed to log actions');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isActionDisabled = (actionId) => {
    const ecoAction = ECO_ACTIONS.find(action => action.id === actionId);
    return todaysActions.some(action => action.type === ecoAction.name);
  };

  const calculateTotalPoints = () => {
    return Array.from(selectedActions).reduce((sum, actionId) => {
      const action = ECO_ACTIONS.find(a => a.id === actionId);
      return sum + (action?.points || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Log Today's Actions</h1>
          <p className="mt-2 text-sm text-gray-600">
            Select the eco-friendly actions you've completed today
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {ECO_ACTIONS.map(action => {
              const isSelected = selectedActions.has(action.id);
              const isDisabled = isActionDisabled(action.id);

              return (
                <div 
                  key={action.id}
                  className={`
                    relative rounded-lg border-2 p-4 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-primary-200'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => !isDisabled && handleActionToggle(action.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{action.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.name}</h3>
                      <p className="text-sm text-gray-500">
                        +{action.points} points • {action.carbonSaved}kg CO₂ saved
                      </p>
                    </div>
                  </div>

                  {isSelected && !isDisabled && (
                    <div className="mt-3">
                      <Input
                        id={`notes-${action.id}`}
                        name={`notes-${action.id}`}
                        placeholder="Add optional notes..."
                        value={notes[action.id] || ''}
                        onChange={(e) => handleNotesChange(action.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  {isDisabled && (
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
                      <span className="text-sm font-medium text-gray-500">
                        Already logged today
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom Action Input */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Action</h3>
            <div className="space-y-4">
              <Input
                id="custom-action"
                name="custom-action"
                placeholder="Describe your eco-friendly action..."
                value={notes.custom || ''}
                onChange={(e) => handleNotesChange('custom', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={selectedActions.size === 0 && !notes.custom}
            >
              Log Actions
            </Button>
          </div>
        </div>

        {/* Points Summary */}
        {selectedActions.size > 0 && (
          <div className="mt-6 bg-primary-50 rounded-lg p-4 text-center">
            <p className="text-primary-700">
              Total points to earn: {calculateTotalPoints()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyActionLogger; 