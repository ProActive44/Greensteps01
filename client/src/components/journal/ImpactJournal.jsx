import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { journalAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ImpactJournal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    totalCarbonSaved: 0,
    totalActions: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    pages: 0
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDetail, setDayDetail] = useState(null);
  const [reflection, setReflection] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);

  useEffect(() => {
    loadJournalData();
  }, [pagination.page]);

  const loadJournalData = async () => {
    try {
      setLoading(true);
      const response = await journalAPI.getJournal(pagination.page, pagination.limit);
      
      if (response.success) {
        setEntries(response.entries || []);
        setStats(response.stats || {
          totalPoints: 0,
          totalCarbonSaved: 0,
          totalActions: 0
        });
        setPagination(response.pagination || {
          page: 1,
          limit: 30,
          total: 0,
          pages: 0
        });
      } else {
        toast.error(response.msg || 'Failed to load journal data');
      }
    } catch (error) {
      toast.error('Failed to load journal data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDateDetail = async (date) => {
    try {
      setSelectedDate(date);
      const response = await journalAPI.getDateDetail(date);
      
      if (response.success) {
        setDayDetail(response);
        
        // Find reflection if it exists
        const reflectionAction = response.actions.find(action => action.type === 'Reflection');
        setReflection(reflectionAction ? reflectionAction.notes : '');
      } else {
        toast.error(response.msg || 'Failed to load day details');
      }
    } catch (error) {
      toast.error('Failed to load day details');
      console.error(error);
    }
  };

  const handleSaveReflection = async () => {
    try {
      if (!selectedDate) return;
      
      setSavingReflection(true);
      const response = await journalAPI.saveReflection(selectedDate, reflection);
      
      if (response.success) {
        toast.success('Reflection saved');
        // Refresh the day's details to show the updated reflection
        await loadDateDetail(selectedDate);
      } else {
        toast.error('Failed to save reflection');
      }
    } catch (error) {
      toast.error('Failed to save reflection');
      console.error(error);
    } finally {
      setSavingReflection(false);
    }
  };

  const handleChangePage = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType) => {
    const icons = {
      'Carpooling': '🚗',
      'Reused Container': '♻️',
      'Skipped Meat': '🥗',
      'Used Public Transport': '🚌',
      'No-Plastic Day': '🌱',
      'Custom': '🌍',
      'Reflection': '📝'
    };
    return icons[actionType] || '🌍';
  };

  if (loading && entries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Impact Journal</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track your eco-friendly journey and reflect on your impact
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/log-action')}
            >
              Log New Action
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-1">
              {stats.totalPoints}
            </div>
            <p className="text-sm text-gray-500">Total Points Earned</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.totalActions}
            </div>
            <p className="text-sm text-gray-500">Actions Completed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {stats.totalCarbonSaved}kg
            </div>
            <p className="text-sm text-gray-500">CO₂ Saved</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Journal Entries List */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-primary-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Journal</h2>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {entries.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p>No journal entries yet.</p>
                    <Button
                      variant="primary"
                      className="mt-4"
                      onClick={() => navigate('/log-action')}
                    >
                      Log Your First Action
                    </Button>
                  </div>
                ) : (
                  entries.map((entry, index) => (
                    <div 
                      key={index}
                      className={`px-6 py-4 cursor-pointer transition-colors hover:bg-gray-50 ${selectedDate === entry.date ? 'bg-primary-50' : ''}`}
                      onClick={() => loadDateDetail(entry.date)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{formatDate(entry.date)}</div>
                        <div className="text-primary-600 text-sm font-semibold">
                          {entry.totalPoints} pts
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <div>{entry.actionCount} actions</div>
                        <div>{entry.totalCarbonSaved}kg CO₂</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-3 bg-gray-50 flex justify-between items-center">
                  <button
                    className="text-sm text-gray-600 disabled:opacity-50"
                    disabled={pagination.page === 1}
                    onClick={() => handleChangePage(pagination.page - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    className="text-sm text-gray-600 disabled:opacity-50"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handleChangePage(pagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Day Detail */}
          <div className="lg:w-2/3">
            {selectedDate && dayDetail ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-primary-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {formatDate(selectedDate)}
                    </h2>
                    <div className="text-sm space-x-4">
                      <span className="text-primary-600 font-medium">
                        {dayDetail.stats.totalPoints} points
                      </span>
                      <span className="text-green-600 font-medium">
                        {dayDetail.stats.totalCarbonSaved}kg CO₂
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Timeline */}
                <div className="px-6 py-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Actions Timeline</h3>
                  <div className="space-y-6">
                    {dayDetail.actions
                      .filter(action => action.type !== 'Reflection')
                      .map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-start">
                          <div className="flex-shrink-0 w-12 text-center">
                            <div className="text-2xl">{getActionIcon(action.type)}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatTime(action.date)}
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-medium text-gray-900">
                                {action.type}
                              </h3>
                              <div className="text-sm text-gray-500">
                                +{action.points} points
                              </div>
                            </div>
                            {action.notes && (
                              <p className="mt-1 text-sm text-gray-600">
                                {action.notes}
                              </p>
                            )}
                            <div className="mt-1 text-xs text-green-600">
                              Saved {action.carbonSaved}kg CO₂
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Daily Reflection */}
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Daily Reflection
                  </h3>
                  <div className="space-y-4">
                    <textarea
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={4}
                      placeholder="Write your thoughts about today's eco-actions..."
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveReflection}
                        loading={savingReflection}
                        disabled={!reflection.trim()}
                      >
                        Save Reflection
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-4">📔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Date</h3>
                <p className="text-gray-500">
                  Click on any date from your journal to view details and add reflections.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactJournal; 