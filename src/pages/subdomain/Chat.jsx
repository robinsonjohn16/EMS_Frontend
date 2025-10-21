import React, { useEffect, useMemo, useRef, useState } from 'react';
import { chatApi } from '../../services/chatApi.js';
import createChatSocket from '../../services/chatSocket.js';
import { Button } from '../../components/ui/button.jsx';

const Chat = () => {
  const [contacts, setContacts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [presence, setPresence] = useState({});
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const roomId = selectedRoom?._id;

  // Initialize socket and listeners
  useEffect(() => {
    const { socket, onNewMessage, onTyping, onPresence, listRooms } = createChatSocket();
    socketRef.current = socket;

    listRooms((res) => {
      if (res?.ok) setRooms(res.rooms || []);
    });

    onNewMessage((msg) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    onTyping(({ roomId: r, userId, isTyping }) => {
      if (!r) return;
      setTypingUsers((prev) => ({ ...prev, [r]: { ...(prev[r] || {}), [userId]: isTyping } }));
    });

    onPresence(({ userId, status }) => {
      setPresence((prev) => ({ ...prev, [userId]: status }));
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Load contacts
  useEffect(() => {
    chatApi.getContacts().then((res) => {
      setContacts(res.data.data?.contacts || []);
    }).catch(() => {});
  }, []);

  // Load messages when room changes
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    chatApi.getMessages(roomId, { limit: 50 }).then((res) => {
      const msgs = (res.data.data?.messages || []).reverse();
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }).finally(() => setLoading(false));
  }, [roomId]);

  const startDirectChat = async (user) => {
    try {
      const res = await chatApi.createDirectRoom(user._id);
      const room = res.data.data || res.data;
      if (room?._id) {
        const exists = rooms.find(r => r._id === room._id);
        if (!exists) setRooms((prev) => [room, ...prev]);
        setSelectedRoom(room);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !roomId) return;
    socketRef.current?.emit('chat:message:send', { roomId, content: input }, (res) => {
      if (!res?.ok) console.error(res?.error);
    });
    setInput('');
  };

  const handleTyping = (value) => {
    setInput(value);
    if (roomId) {
      socketRef.current?.emit('chat:typing', { roomId, isTyping: true });
      // stop typing after delay
      if (handleTyping._typingTimeout) clearTimeout(handleTyping._typingTimeout);
      handleTyping._typingTimeout = setTimeout(() => {
        socketRef.current?.emit('chat:typing', { roomId, isTyping: false });
      }, 800);
    }
  };

  const typingLabel = useMemo(() => {
    const roomTypers = typingUsers[roomId] || {};
    const ids = Object.keys(roomTypers).filter(uid => roomTypers[uid]);
    if (ids.length === 0) return '';
    return ids.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...';
  }, [typingUsers, roomId]);

  return (
    <div className="flex h-full">
      {/* Left panel: contacts and rooms */}
      <div className="w-80 border-r border-gray-200 p-3 space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Contacts</h3>
          <div className="space-y-2">
            {contacts.map((c) => (
              <div key={c._id} className="flex items-center justify-between">
                <button className="text-left hover:underline" onClick={() => startDirectChat(c)}>
                  {c.firstName || c.username} {presence[c._id] === 'online' ? '•' : ''}
                </button>
                <span className="text-xs text-gray-400">{c.role}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Rooms</h3>
          <div className="space-y-2">
            {rooms.map((r) => (
              <button key={r._id} className={`block w-full text-left px-2 py-1 rounded ${selectedRoom?._id===r._id?'bg-blue-50':'hover:bg-gray-50'}`} onClick={() => setSelectedRoom(r)}>
                {r.type === 'group' ? r.name || 'Group' : 'Direct Chat'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {loading && <div className="text-sm text-gray-500">Loading messages...</div>}
          {!roomId && <div className="text-sm text-gray-500">Select a contact or room to start chatting</div>}
          {roomId && (
            <div>
              {messages.map((m) => (
                <div key={m._id} className="mb-2">
                  <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleTimeString()}</div>
                  <div>{m.content}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
        {roomId && (
          <div className="border-t border-gray-200 p-3">
            {typingLabel && <div className="text-xs text-gray-400 mb-1">{typingLabel}</div>}
            <div className="flex items-center gap-2">
              <input
                className="flex-1 border rounded px-2 py-1"
                placeholder="Type a message"
                value={input}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;