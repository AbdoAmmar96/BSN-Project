import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: false,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor — attach Bearer token from storage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bsn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bsn_token');
      localStorage.removeItem('bsn_user');
      // Don't redirect on /auth/me failures (initial check)
      if (!error.config.url?.includes('/auth/me')) {
        window.location.href = '/login';
      }
    }

    // Show toast for unexpected errors
    if (error.response?.status >= 500) {
      toast.error('في مشكلة من السيرفر، حاول تاني');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
