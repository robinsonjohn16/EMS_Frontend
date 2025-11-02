import api from '../lib/api.js';

export const chatApi = {
  // Get all conversations for the organization
  getConversations: async () => {
    const response = await api.get('/tenant/chat/conversations');
    return response.data;
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await api.get(`/tenant/chat/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Send a message
  sendMessage: async (conversationId, content, messageType = 'text', replyTo = null) => {
    const response = await api.post(`/tenant/chat/conversations/${conversationId}/messages`, {
      content,
      messageType,
      replyTo
    });
    return response.data;
  },

  // Create a new conversation
  createConversation: async (name, type = 'direct', participantIds, description = '') => {
    const response = await api.post('/tenant/chat/conversations', {
      name,
      type,
      participantIds,
      description
    });
    return response.data;
  },

  // Get organization users for chat
  getOrganizationUsers: async () => {
    const response = await api.get('/tenant/chat/users');
    return response.data;
  },

  // Update user online status
  updateUserStatus: async (status = 'online') => {
    const response = await api.put('/tenant/chat/status', { status });
    return response.data;
  },

  // Get unread message counts
  getUnreadCounts: async () => {
    const response = await api.get('/tenant/chat/unread-counts');
    return response.data;
  },

  // Edit a message
  editMessage: async (messageId, content) => {
    const response = await api.put(`/tenant/chat/messages/${messageId}`, { content });
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/tenant/chat/messages/${messageId}`);
    return response.data;
  }
};

export default chatApi;


