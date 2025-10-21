import api from '../lib/api';

// Tenant Authentication API
export const tenantAuthApi = {
  // Login tenant user
  login: async (subdomain, credentials) => {
    const response = await api.post('/tenant/auth/login', {
      ...credentials,
      subdomain
    });
    return response.data;
  },

  // Refresh tenant token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/tenant/auth/refresh', {
      refreshToken
    });
    return response.data;
  },

  // Logout tenant user
  logout: async () => {
    const response = await api.post('/tenant/auth/logout');
    return response.data;
  },

  // Get tenant user profile
  getProfile: async () => {
    const response = await api.get('/tenant/auth/profile');
    return response.data;
  },

  // Update tenant user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/tenant/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/tenant/auth/change-password', passwordData);
    return response.data;
  }
};

// Tenant User Management API (for tenant admins and managers)
export const tenantUserApi = {
  // Create new tenant user (tenant admin only)
  createUser: async (organizationId, userData) => {
    const response = await api.post('/tenant/users', userData);
    return response.data;
  },

  // Get all users in organization
  getUsers: async (organizationId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/tenant/users?${queryParams}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (organizationId, userId) => {
    const response = await api.get(`/tenant/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (organizationId, userId, userData) => {
    const response = await api.put(`/tenant/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (organizationId, userId) => {
    const response = await api.delete(`/tenant/users/${userId}`);
    return response.data;
  },

  // Activate/Deactivate user
  toggleUserStatus: async (organizationId, userId, isActive) => {
    const response = await api.patch(`/tenant/users/${userId}/status`, {
      isActive
    });
    return response.data;
  },

  // Reset user password (admin only)
  resetUserPassword: async (organizationId, userId) => {
    const response = await api.post(`/tenant/users/${userId}/reset-password`);
    return response.data;
  },

  // Bulk operations
  bulkUpdateUsers: async (organizationId, operations) => {
    const response = await api.post('/tenant/users/bulk-update', operations);
    return response.data;
  },

  // Get user statistics
  getUserStats: async (organizationId) => {
    const response = await api.get('/tenant/users/stats');
    return response.data;
  },

  // Export users
  exportUsers: async (organizationId, format = 'csv') => {
    const response = await api.get('/tenant/users/export/csv', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Import users
  importUsers: async (organizationId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/tenant/users/${organizationId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Tenant Organization API
export const tenantOrganizationApi = {
  // Get organization details by subdomain
  getBySubdomain: async (subdomain) => {
    const response = await api.get(`/tenant/organization/${subdomain}`);
    return response.data;
  },

  // Update organization settings (admin only)
  updateSettings: async (organizationId, settings) => {
    const response = await api.put(`/tenant/organization/${organizationId}/settings`, settings);
    return response.data;
  },

  // Get organization statistics
  getStats: async (organizationId) => {
    const response = await api.get(`/tenant/organization/${organizationId}/stats`);
    return response.data;
  }
};

// Utility functions
export const tenantUtils = {
  // Extract subdomain from URL
  getSubdomain: () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // For localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Check for subdomain in URL params or localStorage for development
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('subdomain') || localStorage.getItem('dev_subdomain');
    }
    
    // For production, extract subdomain
    if (parts.length > 2) {
      return parts[0];
    }
    
    return null;
  },

  // Set development subdomain
  setDevSubdomain: (subdomain) => {
    localStorage.setItem('dev_subdomain', subdomain);
  },

  // Clear development subdomain
  clearDevSubdomain: () => {
    localStorage.removeItem('dev_subdomain');
  },

  // Check if user has permission
  hasPermission: (user, permission) => {
    if (!user || !user.role) return false;
    
    const rolePermissions = {
      super_admin: ['*'], // All permissions
      manager: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'organization.read',
        'organization.update'
      ],
      manager: [
        'users.read',
        'users.update',
        'organization.read'
      ],
      employee: [
        'users.read',
        'organization.read'
      ]
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  },

  // Format user role for display
  formatRole: (role) => {
    const roleLabels = {
      super_admin: 'Super Admin',
      manager: 'Manager',
      manager: 'Manager',
      employee: 'Employee'
    };
    return roleLabels[role] || role;
  },

  // Get role color for UI
  getRoleColor: (role) => {
    const roleColors = {
      super_admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      manager: 'bg-green-100 text-green-800',
      employee: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  }
};

export default {
  auth: tenantAuthApi,
  users: tenantUserApi,
  organization: tenantOrganizationApi,
  utils: tenantUtils
};