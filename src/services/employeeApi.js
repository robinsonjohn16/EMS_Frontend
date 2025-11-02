import api from '../lib/api';

// Employee Field Management API (for HR/Managers)
export const employeeFieldApi = {
  // Create new field category
  createFieldCategory: async (categoryData) => {
    const response = await api.post('/subdomain/employees/fields/categories', categoryData);
    return response.data;
  },

  // Get all field categories with user data
  getFieldCategories: async () => {
    const response = await api.get('/subdomain/employees/fields/categories?includeUserData=true');
    // If the response data doesn't have categories property, assume the data itself is the categories array
    if (response.data && !response.data.categories && Array.isArray(response.data)) {
      return { data: { categories: response.data } };
    }
    return response.data;
  },

  // Get field category by ID
  getFieldCategory: async (categoryId) => {
    const response = await api.get(`/subdomain/employees/fields/categories/${categoryId}`);
    return response.data;
  },

  // Update field category
  updateFieldCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/subdomain/employees/fields/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete field category
  deleteFieldCategory: async (categoryId) => {
    const response = await api.delete(`/subdomain/employees/fields/categories/${categoryId}`);
    return response.data;
  },

  // Add field to category
  addField: async (categoryId, fieldData) => {
    const response = await api.post(`/subdomain/employees/fields/categories/${categoryId}/fields`, fieldData);
    return response.data;
  },

  // Update field
  updateField: async (categoryId, fieldId, fieldData) => {
    const response = await api.put(`/subdomain/employees/fields/categories/${categoryId}/fields/${fieldId}`, fieldData);
    return response.data;
  },

  // Delete field
  deleteField: async (categoryId, fieldId) => {
    const response = await api.delete(`/subdomain/employees/fields/categories/${categoryId}/fields/${fieldId}`);
    return response.data;
  },

  // Reorder fields
  reorderFields: async (categoryId, orderData) => {
    const response = await api.put(`/subdomain/employees/fields/categories/${categoryId}/reorder`, orderData);
    return response.data;
  }
};

// Employee Details Management API
export const employeeDetailsApi = {
  // Create or update employee details (HR/Manager)
  upsertEmployeeDetails: async (employeeData) => {
    const response = await api.post('/subdomain/employees', employeeData);
    return response.data;
  },

  // Get all employees
  getAllEmployees: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/subdomain/employees?${queryParams}`);
    console.log(response)
    return response.data;
  },

  // Get employee details by ID
  getEmployeeDetails: async (employeeId) => {
    const response = await api.get(`/subdomain/employees/${employeeId}`);
    return response.data;
  },

  // Get employee details by user ID
  getEmployeeDetailsByUserId: async (userId) => {
    const response = await api.get(`/subdomain/employees/user/${userId}`);
    return response.data;
  },

  // Submit employee fields (for employees to fill their own data)
  submitEmployeeFields: async (fieldData) => {
    // Support both JSON and multipart submissions
    const isFormData = typeof FormData !== 'undefined' && fieldData instanceof FormData;

    // Ensure JSON payload has required structure
    if (!isFormData) {
      if (!fieldData.categoryName) {
        console.error('Missing categoryName in submitEmployeeFields');
      }
      const payload = {
        categoryName: fieldData.categoryName,
        fields: fieldData.fields || {}
      };
      const response = await api.post('/subdomain/employees/submit-fields', payload);
      return response.data;
    }

    // Multipart submission
    const response = await api.post('/subdomain/employees/submit-fields', fieldData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update employee fields (for employees to update their own data)
  updateEmployeeFields: async (fieldData) => {
    const isFormData = typeof FormData !== 'undefined' && fieldData instanceof FormData;
    const response = await api.post(
      '/subdomain/employees/submit-fields',
      fieldData,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    );
    return response.data;
  },

  // Upload files for a specific field
  uploadFieldFiles: async (employeeId, categoryName, fieldName, files) => {
    const formData = new FormData();
    (Array.isArray(files) ? files : [files]).forEach((f) => {
      if (f) formData.append('files', f);
    });
    const response = await api.post(
      `/subdomain/employees/${employeeId}/upload/${encodeURIComponent(categoryName)}/${encodeURIComponent(fieldName)}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Update profile settings
  updateProfileSettings: async (employeeId, settings) => {
    const response = await api.put(`/subdomain/employees/${employeeId}/profile-settings`, settings);
    return response.data;
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    const response = await api.get('/subdomain/employees/stats');
    return response.data;
  },

  // Submit employee details for HR approval
  submitForApproval: async (employeeId) => {
    const response = await api.post(`/subdomain/employees/${employeeId}/submit-for-approval`);
    return response.data;
  },

  // HR review employee details (approve/reject)
  reviewEmployeeDetails: async (employeeId, action, comments = '') => {
    const response = await api.post(`/subdomain/employees/${employeeId}/review`, {
      action,
      comments
    });
    return response.data;
  },

  // Get pending approvals for HR
  getPendingApprovals: async () => {
    const response = await api.get('/subdomain/employees/pending-approvals');
    return response.data;
  },

  // Request unlock of fields (employee)
  requestUnlockFields: async (employeeId, reason = '') => {
    const response = await api.post(`/subdomain/employees/${employeeId}/request-unlock`, { reason });
    return response.data;
  },

  // Review unlock request (HR/Manager)
  reviewUnlockRequest: async (employeeId, action, comments = '') => {
    const response = await api.post(`/subdomain/employees/${employeeId}/unlock-review`, { action, comments });
    return response.data;
  },

  // Get pending unlock requests (HR/Manager)
  getPendingUnlockRequests: async () => {
    const response = await api.get('/subdomain/employees/pending-unlock-requests');
    return response.data;
  }
};

export default {
  fields: employeeFieldApi,
  details: employeeDetailsApi
};