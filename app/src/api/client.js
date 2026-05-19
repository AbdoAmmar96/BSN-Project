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

// Rewrite unversioned /api/* paths to /api/v1/* so the rest of the codebase
// can keep writing `/api/projects` while we migrate to versioned routes.
// Unversioned infrastructure paths (health, webhooks) are left alone.
const UNVERSIONED_PREFIXES = ['/api/health', '/api/payments/paymob/webhook', '/api/payments/fawry/webhook', '/api/payments/kashier/webhook'];
apiClient.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/api/') && !config.url.startsWith('/api/v1/')) {
    const skip = UNVERSIONED_PREFIXES.some((p) => config.url.startsWith(p));
    if (!skip) {
      config.url = config.url.replace(/^\/api\//, '/api/v1/');
    }
  }
  return config;
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
