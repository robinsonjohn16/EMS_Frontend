import apiClient from '../lib/api.js';

const base = '/subdomain/chat';

export const chatApi = {
  getContacts: () => apiClient.get(`${base}/contacts`),
  getRooms: () => apiClient.get(`${base}/rooms`),
  createDirectRoom: (otherUserId) => apiClient.post(`${base}/rooms/direct`, { otherUserId }),
  createGroupRoom: ({ name, participantUserIds }) => apiClient.post(`${base}/rooms/group`, { name, participantUserIds }),
  getMessages: (roomId, params = {}) => apiClient.get(`${base}/rooms/${roomId}/messages`, { params }),
  sendMessage: (roomId, payload) => apiClient.post(`${base}/rooms/${roomId}/messages`, payload),
  markRead: (roomId, timestamp) => apiClient.post(`${base}/rooms/${roomId}/read`, { timestamp }),
};

export default chatApi;