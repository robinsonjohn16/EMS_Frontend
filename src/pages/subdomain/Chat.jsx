import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

import { useSocket } from '@/contexts/SocketContext';
import chatApi from '@/services/chatApi';
import { getAssetUrl } from '@/lib/assets';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chatName, setChatName] = useState('');
  const [chatDescription, setChatDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());

  const user = useSelector(state => state.tenantAuth.user);
  const { 
    socket, 
    isConnected, 
    conversations,
    organizationUsers,
    totalUnreadCount,
    joinConversation, 
    leaveConversation, 
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markMessagesRead,
    getUserStatus,
    getUnreadCount,
    requestConversations,
    requestOrganizationUsers,
    requestMessages
  } = useSocket();

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show connection status and retry if not connected
  useEffect(() => {
    if (!isConnected && socket) {
      const retryInterval = setInterval(() => {
        console.log('Attempting to reconnect Socket.IO...');
        socket.connect();
      }, 5000);
      
      return () => clearInterval(retryInterval);
    }
  }, [isConnected, socket]);

  // Initialize data
  useEffect(() => {
    if (isConnected) {
      setLoading(false);
    }
  }, [isConnected]);

  // Load messages for selected conversation
  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      requestMessages(conversationId);
      
      // Join conversation room
      joinConversation(conversationId);
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    if (selectedConversation?._id === conversation._id) return;
    
    // Leave previous conversation
    if (selectedConversation) {
      leaveConversation(selectedConversation._id);
    }
    
    setSelectedConversation(conversation);
    loadMessages(conversation._id);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    try {
      // Send via Socket.IO for real-time delivery
      socketSendMessage(selectedConversation._id, messageContent);
      
      // Also send via API for persistence
      await chatApi.sendMessage(selectedConversation._id, messageContent);
      
      // Stop typing indicator
      stopTyping(selectedConversation._id);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (!selectedConversation) return;
    
    startTyping(selectedConversation._id);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversation._id);
    }, 1000);
  };

  // Create new conversation
  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    try {
      const isGroup = selectedUsers.length > 1;
      const response = await chatApi.createConversation(
        isGroup ? chatName : '',
        isGroup ? 'group' : 'direct',
        selectedUsers,
        chatDescription
      );

      const newConversation = response.data.conversation;
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      
      // Reset form
      setSelectedUsers([]);
      setChatName('');
      setChatDescription('');
      setShowNewChatDialog(false);
      
      toast.success('Conversation created successfully');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  // Handle user selection for new chat
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Helper: get current user id safely
  const getCurrentUserId = () => {
    return user?._id ?? user?.id ?? null;
  };

  // Get conversation display name
  const getConversationName = (conversation) => {
    if (!conversation) return 'Chat';
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    } else {
      const currId = getCurrentUserId();
      const otherParticipant = (conversation.participants || []).find(p => 
        p?.userId?._id && currId && String(p.userId._id) !== String(currId)
      ) || (conversation.participants || [])[0];
      const u = otherParticipant?.userId || {};
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Direct Chat';
      return name;
    }
  };

  // Get conversation avatar
  const getConversationAvatar = (conversation) => {
    if (!conversation) return undefined;
    if (conversation.type === 'group') {
      return conversation.avatar;
    } else {
      const currId = getCurrentUserId();
      const otherParticipant = (conversation.participants || []).find(p => 
        p?.userId?._id && currId && String(p.userId._id) !== String(currId)
      ) || (conversation.participants || [])[0];
      return otherParticipant?.userId?.avatar;
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    const name = (getConversationName(conv) || '').toLowerCase();
    return name.includes((searchQuery || '').toLowerCase());
  });

  // Format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessagesData = (data) => {
      const { conversationId, messages: newMessages } = data;
      
      if (selectedConversation && conversationId === selectedConversation._id) {
        setMessages(newMessages || []);
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleNewMessage = (data) => {
      const { message, conversation } = data;
      
      // Update messages if it's for the current conversation
      if (selectedConversation && conversation._id === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleUserTyping = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setTypingUsers(prev => new Set([...prev, data.userId]));
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    socket.on('messages_data', handleMessagesData);
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('messages_data', handleMessagesData);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, selectedConversation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Messages</h1>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={isConnected ? 'Connected' : 'Disconnected'} />
            </div>
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chatName">Chat Name (for group chats)</Label>
                    <Input
                      id="chatName"
                      value={chatName}
                      onChange={(e) => setChatName(e.target.value)}
                      placeholder="Enter chat name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatDescription">Description (optional)</Label>
                    <Textarea
                      id="chatDescription"
                      value={chatDescription}
                      onChange={(e) => setChatDescription(e.target.value)}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Select Users</Label>
                    <ScrollArea className="h-48 border rounded-md p-2">
                      {organizationUsers.map(orgUser => (
                        <div key={orgUser._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                          <Checkbox
                            id={orgUser._id}
                            checked={selectedUsers.includes(orgUser._id)}
                            onCheckedChange={() => handleUserSelect(orgUser._id)}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getAssetUrl(orgUser.avatar)} />
                            <AvatarFallback>
                              {orgUser.firstName?.[0]}{orgUser.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {orgUser.firstName} {orgUser.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{orgUser.email}</p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateConversation}>
                      Create Chat
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to begin messaging</p>
              </div>
            ) : (
              filteredConversations.map(conversation => {
                const unreadCount = getUnreadCount(conversation._id);
                const isSelected = selectedConversation?._id === conversation._id;
                
                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={getAssetUrl(getConversationAvatar(conversation))} />
                          <AvatarFallback>
                            {getConversationName(conversation).split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.type === 'group' && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            <Users className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {getConversationName(conversation)}
                          </h3>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400">
                          {formatMessageTime(conversation.lastMessageAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getAssetUrl(getConversationAvatar(selectedConversation))} />
                    <AvatarFallback>
                      {getConversationName(selectedConversation).split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getConversationName(selectedConversation)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.type === 'group' ? 
                        `${selectedConversation.participants.length} members` : 
                        'Direct message'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message._id}
                    className={`flex ${message.senderId._id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId._id === user.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      {message.senderId._id !== user.id && (
                        <p className="text-xs font-medium mb-1">
                          {message.senderId.firstName} {message.senderId.lastName}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId._id === user.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicators */}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
                      <p className="text-sm">Someone is typing...</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
