import apiClient from '../lib/api';

export const userAttendanceConfigApi = {
  list: async () => apiClient.get('/subdomain/user-attendance-config'),
  get: async (userId) => apiClient.get(`/subdomain/user-attendance-config/${userId}`),
  update: async (userId, payload) => apiClient.put(`/subdomain/user-attendance-config/${userId}`, payload),
};

export default userAttendanceConfigApi;