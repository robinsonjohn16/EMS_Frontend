import { io } from 'socket.io-client';
import apiClient from '../lib/api.js';

function getSubdomain() {
  const { hostname } = window.location;
  const urlParams = new URLSearchParams(window.location.search);
  let subdomain = urlParams.get('subdomain');
  if (!subdomain) {
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www') {
      subdomain = parts[0];
    } else {
      subdomain = localStorage.getItem('dev_subdomain') || null;
    }
  }
  return subdomain;
}

function getSocketBaseURL() {
  const baseURL = apiClient.defaults.baseURL || 'http://localhost:5000/api/v1';
  return baseURL.replace(/\/api\/v1$/, '');
}

export function createChatSocket() {
  const token = localStorage.getItem('tenantToken');
  const subdomain = getSubdomain();
  const socketBaseURL = getSocketBaseURL();

  const socket = io(socketBaseURL, {
    transports: ['websocket'],
    withCredentials: true,
    auth: { token, subdomain },
  });

  // Helpers
  const onNewMessage = (handler) => socket.on('chat:message:new', handler);
  const onTyping = (handler) => socket.on('chat:typing', handler);
  const onPresence = (handler) => socket.on('presence:update', handler);

  const sendMessage = (payload, cb) => socket.emit('chat:message:send', payload, cb);
  const emitTyping = (payload) => socket.emit('chat:typing', payload);
  const markRead = (payload, cb) => socket.emit('chat:read', payload, cb);
  const listRooms = (cb) => socket.emit('chat:rooms:list', null, cb);
  const listMessages = (payload, cb) => socket.emit('chat:messages:list', payload, cb);
  const createDirectRoom = (payload, cb) => socket.emit('chat:room:create:direct', payload, cb);

  return {
    socket,
    onNewMessage,
    onTyping,
    onPresence,
    sendMessage,
    emitTyping,
    markRead,
    listRooms,
    listMessages,
    createDirectRoom,
  };
}

export default createChatSocket;