import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

apiClient.interceptors.request.use(
  (config) => {
    const { hostname } = window.location;

    // Attach tenant token if available
    const token = localStorage.getItem('tenantToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Derive subdomain for tenant requests (dev + prod)
    const urlParams = new URLSearchParams(window.location.search);
    let headerSubdomain = urlParams.get('subdomain');
    if (!headerSubdomain) {
      const hostParts = hostname.split('.');
      if (hostParts.length > 2 && hostParts[0] !== 'www') {
        headerSubdomain = hostParts[0];
      } else {
        // Dev convenience: allow localStorage override on localhost
        headerSubdomain = localStorage.getItem('dev_subdomain') || null;
      }
    }
    if (headerSubdomain) {
      config.headers = {
        ...config.headers,
        'X-Tenant-Subdomain': headerSubdomain,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Admin/Auth API for top-level (non-tenant) authentication flows
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/profile'),
};

// Admin Organization API for managing organizations (non-tenant)
export const organizationApi = {
  getAll: () => apiClient.get('/organizations'),
  getById: (id) => apiClient.get(`/organizations/${id}`),
  create: (data) => apiClient.post('/organizations', data),
  update: (id, data) => apiClient.put(`/organizations/${id}`, data),
  delete: (id) => apiClient.delete(`/organizations/${id}`),
};

export default apiClient;