import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if stored
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('polar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Fallback if token is in user object
    const user = localStorage.getItem('polar_user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Error parsing stored user auth', e);
      }
    }
  }
  return config;
});

// Response interceptor to handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we're already on login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('polar_token');
        localStorage.removeItem('polar_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication APIs
  login: async (username, password, station) => {
    const res = await apiClient.post('/auth/login', { username, password, station });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    try {
      const res = await apiClient.post('/auth/logout');
      return res.data;
    } catch (e) {
      return { message: 'Logged out' };
    }
  },

  // Admin Operator Management APIs
  getOperators: async () => {
    const res = await apiClient.get('/admin/operators');
    return res.data;
  },
  createOperator: async (operatorData) => {
    const res = await apiClient.post('/admin/operators', operatorData);
    return res.data;
  },
  getOperator: async (operatorId) => {
    const res = await apiClient.get(`/admin/operators/${operatorId}`);
    return res.data;
  },
  updateOperator: async (operatorId, updateData) => {
    const res = await apiClient.put(`/admin/operators/${operatorId}`, updateData);
    return res.data;
  },
  resetOperatorPassword: async (operatorId, passwordData) => {
    const res = await apiClient.put(`/admin/operators/${operatorId}/password`, passwordData);
    return res.data;
  },
  updateOperatorStatus: async (operatorId, status) => {
    const res = await apiClient.put(`/admin/operators/${operatorId}/status`, { status });
    return res.data;
  },
  deleteOperator: async (operatorId) => {
    const res = await apiClient.delete(`/admin/operators/${operatorId}`);
    return res.data;
  },

  // Dashboard Telemetry
  getDashboard: async () => {
    const res = await apiClient.get('/dashboard');
    return res.data;
  },

  // Predictions
  getLoadPredictions: async () => {
    const res = await apiClient.get('/predictions/load');
    return res.data;
  },
  getSolarPredictions: async () => {
    const res = await apiClient.get('/predictions/solar');
    return res.data;
  },
  getWindPredictions: async () => {
    const res = await apiClient.get('/predictions/wind');
    return res.data;
  },
  getAllPredictions: async () => {
    const res = await apiClient.get('/predictions/all');
    return res.data;
  },

  // Optimization
  runOptimization: async (params = {}) => {
    const res = await apiClient.post('/optimization/run', params);
    return res.data;
  },

  // Alerts & Anomalies
  getAlerts: async () => {
    const res = await apiClient.get('/alerts');
    return res.data;
  },
  resolveAlert: async (alertId) => {
    const res = await apiClient.post(`/alerts/${alertId}/resolve`);
    return res.data;
  },
  getAnomalies: async () => {
    const res = await apiClient.get('/anomalies');
    return res.data;
  },

  // Simulation & Real-time Telemetry
  runSimulation: async (simulationParams) => {
    const res = await apiClient.post('/simulation/run', simulationParams);
    return res.data;
  },
  getLiveTelemetry: async () => {
    const res = await apiClient.get('/simulation/telemetry');
    return res.data;
  },
  updateLiveTelemetry: async (telemetryData) => {
    const res = await apiClient.post('/simulation/telemetry', telemetryData);
    return res.data;
  },
  recordDangerAlert: async (alertData) => {
    const res = await apiClient.post('/simulation/danger-alert', alertData);
    return res.data;
  },

  // Data Management
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  getDatasets: async () => {
    const res = await apiClient.get('/data/datasets');
    return res.data;
  },
  getDataStats: async () => {
    const res = await apiClient.get('/data/stats');
    return res.data;
  },
  reseedDemoData: async () => {
    const res = await apiClient.post('/data/reseed');
    return res.data;
  },
  getTemplateDownloadUrl: () => `${API_BASE_URL}/data/template`,

  // Reports
  getReports: async (period = 'daily', startDate = null, endDate = null) => {
    const params = { period };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const res = await apiClient.get('/reports', { params });
    return res.data;
  },
  getExportUrl: (period = 'daily') => `${API_BASE_URL}/reports/export?period=${period}`,

  // Settings
  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data;
  },
  saveSettings: async (settingsData) => {
    const res = await apiClient.put('/settings', settingsData);
    return res.data;
  },
};

export default api;
