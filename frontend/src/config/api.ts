import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// WebSocket connection helper
export const createWebSocket = () => {
  return new WebSocket(WS_URL);
};

// API endpoints
export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  games: {
    jackpot: {
      current: '/api/games/jackpot/current',
      join: '/api/games/jackpot/join',
    },
    coinflip: {
      create: '/api/games/coinflip/create',
      join: '/api/games/coinflip/join',
    },
    crash: {
      create: '/api/games/crash/create',
      join: '/api/games/crash/join',
    },
  },
  user: {
    profile: '/api/user/profile',
    balance: '/api/user/balance',
    transactions: '/api/user/transactions',
  },
};

export default api; 