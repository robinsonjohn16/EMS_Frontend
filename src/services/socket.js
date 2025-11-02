import { io } from 'socket.io-client';

export function connectSocket() {
  const token = localStorage.getItem('tenantToken');
  const baseCandidate = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const baseUrl = String(baseCandidate)
    .replace(/\/$/, '')
    .replace(/\/api(\/v\d+)?\/?$/i, '');

  const socket = io(baseUrl, {
    transports: ['websocket'],
    auth: { token },
    withCredentials: true
  });

  return socket;
}