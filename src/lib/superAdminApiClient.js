import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Separate axios instance for Super Admin (non-subdomain)
const superAdminClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach super admin token only (no tenant subdomain headers)
superAdminClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // super admin access token
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    // Do NOT attach X-Tenant-Subdomain here
    return config;
  },
  (error) => Promise.reject(error)
);

export default superAdminClient;