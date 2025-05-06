const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function for making API requests
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['x-auth-token'] = token;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: (email, password) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  register: (username, email, password) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },
  
  getCurrentUser: () => {
    return apiRequest('/api/auth/me');
  },
};


// Info API
export const infoAPI = {
};


// Action API
export const actionAPI = {
  getAllActions: () => {
    return apiRequest('/api/info/my-actions');
  },

  
  logActions: (actions) => {
    return apiRequest('/api/actions', {
      method: 'POST',
      body: JSON.stringify({ actions }),
    });
  },
  
  getActions: (page = 1, limit = 20, dateRange = null) => {
    let queryParams = `?page=${page}&limit=${limit}`;
    
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      queryParams += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    }
    
    return apiRequest(`/api/actions${queryParams}`);
  },
  
  getTodaysActions: () => {
    return apiRequest('/api/actions/today');
  },
  
  getActionStats: () => {
    return apiRequest('/api/actions/stats');
  },
};

// Badge API
export const badgeAPI = {
  getAllBadges: () => {
    return apiRequest('/api/badges');
  },
  
  getUserBadges: () => {
    return apiRequest('/api/badges/user');
  },
};

// Community API
export const communityAPI = {
  getStats: () => {
    return apiRequest('/api/community/stats');
  },
  
  getLeaderboard: (limit = 10) => {
    return apiRequest(`/api/community/leaderboard?limit=${limit}`);
  },
};

// Journal API
export const journalAPI = {
  getJournal: (page = 1, limit = 30) => {
    return apiRequest(`/api/journal?page=${page}&limit=${limit}`);
  },
  
  getDateDetail: (date) => {
    return apiRequest(`/api/journal/${date}`);
  },
  
  saveReflection: (date, reflection) => {
    return apiRequest(`/api/journal/${date}/reflection`, {
      method: 'POST',
      body: JSON.stringify({ reflection }),
    });
  },
};

// Progress API
export const progressAPI = {
  getProgressData: () => {
    return apiRequest('/api/progress');
  },
  
  getMonthlyProgress: (year = new Date().getFullYear()) => {
    return apiRequest(`/api/progress/monthly?year=${year}`);
  },
  
  getCategoryImpact: () => {
    return apiRequest('/api/progress/categories');
  },

  getAllActions: () => {
    return apiRequest('/api/info/my-actions');
  }
};




export default {
  auth: authAPI,
  actions: actionAPI,
  badges: badgeAPI,
  community: communityAPI,
  journal: journalAPI,
  progress: progressAPI
}; 