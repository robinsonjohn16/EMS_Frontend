import superAdminClient from './superAdminApiClient';

export const superAdminAuthApi = {
  login: (credentials) => superAdminClient.post('/auth/login', credentials),
  register: (userData) => superAdminClient.post('/auth/register', userData),
  logout: () => superAdminClient.post('/auth/logout'),
  getProfile: () => superAdminClient.get('/auth/profile'),
};

export default superAdminAuthApi;