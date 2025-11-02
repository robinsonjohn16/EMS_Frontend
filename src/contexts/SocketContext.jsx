import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [organizationUsers, setOrganizationUsers] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  
  const user = useSelector(state => state.tenantAuth.user);
  let token = useSelector(state => state.tenantAuth.token);
  console.log(token);
  if(!token){
    token = localStorage.getItem('tenantToken');
  }
  console.log(token);
  const socketRef = useRef(null);

  // Helper: safely get current user id
  const getCurrentUserId = () => {
    return user?._id ?? user?.id ?? null;
  };

  useEffect(() => {
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
        setIsConnected(false);
        setConversations([]);
        setOrganizationUsers([]);
        setTotalUnreadCount(0);
      }
      return;
    }

    console.log('Initializing Socket.IO connection with token:', token ? 'Token present' : 'No token');
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

    // Initialize socket connection
    // Prefer current origin; fallback to env URLs. Strip any trailing /api[/vX]
    const baseCandidate = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin;
    let socketUrl;
    try {
      const u = new URL(baseCandidate);
      socketUrl = u.origin.replace(/\/$/, '').replace(/\/api(\/v\d+)?\/?$/i, '');
    } catch {
      socketUrl = String(baseCandidate).replace(/\/$/, '').replace(/\/api(\/v\d+)?\/?$/i, '');
    }
    
    console.log('Connecting to Socket.IO server at:', socketUrl);
    
    const newSocket = io(socketUrl, {
      auth: {
        token: token
      },
      path: '/socket.io', // Explicitly set the path to match backend
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Request initial data when connected
      newSocket.emit('request_conversations');
      newSocket.emit('request_organization_users');
      newSocket.emit('request_unread_counts');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type
      });
      
      // Only show toast message once per session
      if (!window._socketErrorShown) {
        window._socketErrorShown = true;
        
        if (error.message.includes('Authentication error')) {
          toast.error('Authentication failed. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('tenantToken');
          localStorage.removeItem('tenantRefreshToken');
          localStorage.removeItem('tenantUser');
        } else if (error.message.includes('Invalid namespace')) {
          toast.error('Connection error. Trying to reconnect...');
          // Try reconnecting after a delay
          setTimeout(() => {
            window._socketErrorShown = false;
            newSocket.connect();
          }, 3000);
        } else {
          toast.error('Connection error. Trying to reconnect...');
        }
      }
      
      // Try to reconnect after a delay
      setTimeout(() => {
        try {
          if (!newSocket.connected) {
            console.log('Attempting to reconnect Socket.IO...');
            newSocket.connect();
          }
        } catch (e) {
          console.error('Reconnection attempt failed:', e);
        }
      }, 5000);
    });

    // Message event handlers
    newSocket.on('new_message', (data) => {
      const { message, conversation } = data;
      
      // Update unread counts
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        if (!newCounts[conversation._id]) {
          newCounts[conversation._id] = 0;
        }
        // Don't increment if it's from current user
        const currId = getCurrentUserId();
        if (message?.senderId?._id && currId && String(message.senderId._id) !== String(currId)) {
          newCounts[conversation._id] += 1;
        }
        return newCounts;
      });

      // Show notification for messages not from current user
      const currId = getCurrentUserId();
      if (message?.senderId?._id && currId && String(message.senderId._id) !== String(currId)) {
        toast.info(`New message from ${message.senderId.firstName} ${message.senderId.lastName}`, {
          description: message.content?.length > 50 ? 
            message.content.substring(0, 50) + '...' : 
            message.content
        });
      }
    });

    newSocket.on('conversation_updated', (data) => {
      // Handle conversation updates (new messages, etc.)
      console.log('Conversation updated:', data);
    });

    newSocket.on('user_status_changed', (data) => {
      const { userId, isOnline, status, lastSeen, user: userData } = data;
      
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        if (isOnline) {
          newMap.set(userId, {
            isOnline: true,
            status,
            lastSeen,
            user: userData
          });
        } else {
          newMap.set(userId, {
            isOnline: false,
            status: 'offline',
            lastSeen,
            user: userData
          });
        }
        return newMap;
      });
    });

    newSocket.on('user_typing', (data) => {
      // Handle typing indicators
      console.log('User typing:', data);
    });

    newSocket.on('user_stopped_typing', (data) => {
      // Handle typing stop indicators
      console.log('User stopped typing:', data);
    });

    newSocket.on('messages_read', (data) => {
      // Handle messages read events
      console.log('Messages read:', data);
    });

    // Data response handlers
    newSocket.on('conversations_data', (data) => {
      setConversations(data.conversations || []);
    });

    newSocket.on('organization_users_data', (data) => {
      setOrganizationUsers(data.users || []);
    });

    newSocket.on('unread_counts_data', (data) => {
      setTotalUnreadCount(data.totalUnread || 0);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'An error occurred');
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]);

  // Socket methods
  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const sendMessage = (conversationId, content, messageType = 'text', replyTo = null) => {
    if (socket) {
      socket.emit('send_message', {
        conversationId,
        content,
        messageType,
        replyTo
      });
    }
  };

  const startTyping = (conversationId) => {
    if (socket) {
      socket.emit('typing_start', { conversationId });
    }
  };

  const stopTyping = (conversationId) => {
    if (socket) {
      socket.emit('typing_stop', { conversationId });
    }
  };

  const markMessagesRead = (conversationId) => {
    if (socket) {
      socket.emit('mark_messages_read', { conversationId });
      
      // Update local unread counts
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        newCounts[conversationId] = 0;
        return newCounts;
      });
    }
  };

  const updateStatus = (status) => {
    if (socket) {
      socket.emit('update_status', { status });
    }
  };

  const getUserStatus = (userId) => {
    return onlineUsers.get(userId) || {
      isOnline: false,
      status: 'offline',
      lastSeen: null
    };
  };

  const getUnreadCount = (conversationId) => {
    const conversation = conversations.find(c => c._id === conversationId);
    return conversation?.unreadCount || 0;
  };

  // Socket.IO data fetching methods
  const requestConversations = () => {
    if (socket) {
      socket.emit('request_conversations');
    }
  };

  const requestOrganizationUsers = () => {
    if (socket) {
      socket.emit('request_organization_users');
    }
  };

  const requestUnreadCounts = () => {
    if (socket) {
      socket.emit('request_unread_counts');
    }
  };

  const requestMessages = (conversationId) => {
    if (socket) {
      socket.emit('request_messages', { conversationId });
    }
  };

  const value = {
    socket,
    isConnected,
    conversations,
    organizationUsers,
    totalUnreadCount,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesRead,
    updateStatus,
    getUserStatus,
    getUnreadCount,
    requestConversations,
    requestOrganizationUsers,
    requestUnreadCounts,
    requestMessages
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
