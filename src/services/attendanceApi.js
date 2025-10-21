import apiClient from '../lib/api';

const attendanceApi = {
  checkIn: async ({ timestamp, location, source = 'web' } = {}) => {
    const payload = { timestamp, location, source };
    const res = await apiClient.post('/subdomain/attendance/checkin', payload);
    return res.data?.data || res.data;
  },
  checkOut: async ({ timestamp, location, source = 'web' } = {}) => {
    const payload = { timestamp, location, source };
    const res = await apiClient.post('/subdomain/attendance/checkout', payload);
    return res.data?.data || res.data;
  },
  getMonthly: async ({ month } = {}) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    const res = await apiClient.get(`/subdomain/attendance/monthly?${params.toString()}`);
    return res.data?.data || res.data;
  },
  adminSetStatusForUser: async (userId, { date, status, notes } = {}) => {
    const payload = { date, status, notes };
    const res = await apiClient.post(`/subdomain/attendance/admin/set/${userId}`, payload);
    return res.data?.data || res.data;
  },
  adminBulkSetStatus: async ({ date, status, notes, userIds, all } = {}) => {
    const payload = { date, status, notes, userIds, all };
    const res = await apiClient.post('/subdomain/attendance/admin/bulk-set', payload);
    return res.data?.data || res.data;
  }
};

export default attendanceApi;