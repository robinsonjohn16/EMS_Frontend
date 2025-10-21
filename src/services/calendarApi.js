import apiClient from '../lib/api';

const calendarApi = {
  // Fetch aggregated calendar data for current user or specified employee (HR/Manager)
  getCalendarData: async ({ start, end, employeeId } = {}) => {
    try {
      const params = new URLSearchParams();
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (employeeId) params.append('employeeId', employeeId);
      const response = await apiClient(`/subdomain/calendar?${params.toString()}`);
      return response.data?.data || response.data; // support successResponse shape
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default calendarApi;