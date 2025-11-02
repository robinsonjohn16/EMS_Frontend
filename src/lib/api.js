import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;
import superAdminApiClient from './superAdminApiClient'; 
// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

apiClient.interceptors.request.use(
  (config) => {
    const { hostname } = window.location;
    const baseLabel = import.meta.env.VITE_APP_BASE_SUBDOMAIN || 'app';
    const mainHost = (import.meta.env.VITE_MAIN_APP_HOST || '').toLowerCase();

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
      const hn = hostname.toLowerCase();

      if (hostname.includes('localhost')) {
        // Dev convenience: allow localStorage override on localhost
        headerSubdomain = localStorage.getItem('dev_subdomain') || null;
      } else if (mainHost) {
        if (hn === mainHost) {
          headerSubdomain = null; // main app host -> no tenant header
        } else if (hn.endsWith(`.${mainHost}`) && hostParts.length >= 3 && hostParts[0] !== 'www') {
          headerSubdomain = hostParts[0];
        }
      } else if (hostParts.length > 2 && hostParts[0] !== 'www') {
        // Heuristic fallback when main host not configured
        headerSubdomain = hostParts[0];
      }
    }
    // Avoid sending base app label as tenant subdomain
    if (headerSubdomain && headerSubdomain !== baseLabel) {
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
  login: (credentials) => superAdminApiClient.post('/auth/login', credentials),
  register: (userData) => superAdminApiClient.post('/auth/register', userData),
  logout: () => superAdminApiClient.post('/auth/logout'),
  getProfile: () => superAdminApiClient.get('/auth/profile'),
};

// Admin Organization API for managing organizations (non-tenant)
export const organizationApi = {
  getAll: () => superAdminApiClient.get('/organizations'),
  getById: (id) => superAdminApiClient.get(`/organizations/${id}`),
  create: (data) => superAdminApiClient.post('/organizations', data),
  update: (id, data) => superAdminApiClient.put(`/organizations/${id}`, data),
  delete: (id) => superAdminApiClient.delete(`/organizations/${id}`),
};

export default apiClient;