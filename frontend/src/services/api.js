import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add wallet address to headers
api.interceptors.request.use(
  (config) => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (walletAddress) {
      config.headers['x-wallet-address'] = walletAddress;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('walletAddress');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  create: (userData) => api.post('/api/users', userData),
  get: (walletAddress) => api.get(`/api/users/${walletAddress}`),
};

// Farm API
export const farmAPI = {
  create: (farmData) => api.post('/api/farms', farmData),
  getAll: () => api.get('/api/farms'),
};

// Marketplace API
export const marketplaceAPI = {
  getBatches: (params = {}) => api.get('/api/marketplace/batches', { params }),
  getBatch: (batchId) => api.get(`/api/marketplace/batches/${batchId}`),
  createBatch: (batchData) => api.post('/api/marketplace/batches', batchData),
  listBatch: (batchId, priceWei) => api.post(`/api/marketplace/batches/${batchId}/list`, { priceWei }),
  fundEscrow: (batchId, value) => api.post(`/api/marketplace/batches/${batchId}/fund-escrow`, { value }),
  markDelivered: (batchId) => api.post(`/api/marketplace/batches/${batchId}/deliver`),
  releaseFunds: (batchId) => api.post(`/api/marketplace/batches/${batchId}/release`),
  refund: (batchId) => api.post(`/api/marketplace/batches/${batchId}/refund`),
};

// Provenance API
export const provenanceAPI = {
  getBatch: (batchId) => api.get(`/api/provenance/batches/${batchId}`),
  addNote: (batchId, noteData) => api.post(`/api/provenance/batches/${batchId}/notes`, noteData),
  verify: (batchId) => api.get(`/api/provenance/batches/${batchId}/verify`),
  getQR: (batchId) => api.get(`/api/provenance/batches/${batchId}/qr`),
  search: (searchData) => api.post('/api/provenance/search', searchData),
};

// AI API
export const aiAPI = {
  detectDisease: (formData) => api.post('/api/ai/detect-disease', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  scoreQuality: (formData) => api.post('/api/ai/score-quality', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  forecastYield: (data) => api.post('/api/ai/forecast-yield', data),
  forecastPrice: (data) => api.post('/api/ai/forecast-price', data),
  analyzeBatch: (formData) => api.post('/api/ai/analyze-batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getStatus: () => api.get('/api/ai/status'),
};

// Sustainable Incentives API
export const incentivesAPI = {
  getFarmerProfile: (walletAddress) => api.get(`/api/incentives/farmer/${walletAddress}`),
  getIncentives: (params = {}) => api.get('/api/incentives', { params }),
  getIncentive: (incentiveId) => api.get(`/api/incentives/${incentiveId}`),
  claimIncentive: (incentiveId) => api.post(`/api/incentives/${incentiveId}/claim`),
  getLeaderboard: (params = {}) => api.get('/api/incentives/leaderboard', { params }),
  updateFarmerData: (walletAddress, data) => api.post(`/api/incentives/farmer/${walletAddress}/update`, data),
};

export default api;
