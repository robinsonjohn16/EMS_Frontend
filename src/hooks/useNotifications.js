import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNotificationCount } from '../store/slices/uiSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.ui.notifications);

  // This would typically fetch notifications from an API
  // For now, we'll simulate some notifications
  useEffect(() => {
    // Simulate fetching notifications
    const fetchNotifications = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await notificationService.getUnreadCount();
        // dispatch(setNotificationCount(response.count));
        
        // For demo purposes, set a random count
        const mockCount = Math.floor(Math.random() * 5);
        dispatch(setNotificationCount(mockCount));
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    
    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  const markAsRead = async (notificationId) => {
    try {
      // In a real app, this would be an API call
      // await notificationService.markAsRead(notificationId);
      
      // For demo purposes, just reduce the count
      if (unreadCount > 0) {
        dispatch(setNotificationCount(unreadCount - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // In a real app, this would be an API call
      // await notificationService.markAllAsRead();
      
      dispatch(setNotificationCount(0));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return {
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};








