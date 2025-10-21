import api from '../lib/api';

export const attendanceConfigApi = {
  get: async () => {
    const response = await api.get('/subdomain/attendance-config');
    return response.data;
  },
  update: async (config) => {
    const response = await api.put('/subdomain/attendance-config', config);
    return response.data;
  }
};

export default attendanceConfigApi;