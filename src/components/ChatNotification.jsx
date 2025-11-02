import React from 'react';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/contexts/SocketContext';

const ChatNotification = () => {
  const { totalUnreadCount } = useSocket();
  const user = useSelector(state => state.tenantAuth.user);

  if (!user || totalUnreadCount === 0) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
    >
      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
    </Badge>
  );
};

export default ChatNotification;
