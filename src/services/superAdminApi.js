import api from '../lib/api';

// Super Admin Tenant User Management API
export const superAdminTenantUserApi = {
  // Create new tenant user
  createUser: async (userData) => {
    const response = await api.post('/super-admin/tenant-users', userData);
    return response.data;
  },

  // Get all tenant users across organizations
  getAllUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/super-admin/tenant-users?${queryParams}`);
    return response.data;
  },

  // Get tenant user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/super-admin/tenant-users/${userId}`);
    return response.data;
  },

  // Update tenant user
  updateUser: async (userId, userData) => {
    const response = await api.put(`/super-admin/tenant-users/${userId}`, userData);
    return response.data;
  },

  // Delete tenant user
  deleteUser: async (userId) => {
    const response = await api.delete(`/super-admin/tenant-users/${userId}`);
    return response.data;
  },

  // Toggle user status (activate/deactivate)
  toggleUserStatus: async (userId) => {
    const response = await api.patch(`/super-admin/tenant-users/${userId}/toggle-status`);
    return response.data;
  },

  // Get users by organization
  getUsersByOrganization: async (organizationId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/super-admin/tenant-users/organization/${organizationId}?${queryParams}`);
    return response.data;
  }
};

// Super Admin Organization Management API
export const superAdminOrganizationApi = {
  // Get all organizations
  getAllOrganizations: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/organizations?${queryParams}`);
    return response.data;
  },

  // Get organization by ID
  getOrganizationById: async (organizationId) => {
    const response = await api.get(`/organizations/${organizationId}`);
    return response.data;
  },

  // Create new organization
  createOrganization: async (organizationData) => {
    const response = await api.post('/organizations', organizationData);
    return response.data;
  },

  // Update organization
  updateOrganization: async (organizationId, organizationData) => {
    const response = await api.put(`/organizations/${organizationId}`, organizationData);
    return response.data;
  },

  // Delete organization
  deleteOrganization: async (organizationId) => {
    const response = await api.delete(`/organizations/${organizationId}`);
    return response.data;
  }
};

// Super Admin Dashboard API
export const superAdminDashboardApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/super-admin/dashboard/stats');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    const response = await api.get(`/super-admin/dashboard/activities?limit=${limit}`);
    return response.data;
  },

  // Get system health
  getSystemHealth: async () => {
    const response = await api.get('/super-admin/dashboard/health');
    return response.data;
  }
};

export default {
  tenantUsers: superAdminTenantUserApi,
  organizations: superAdminOrganizationApi,
  dashboard: superAdminDashboardApi
};