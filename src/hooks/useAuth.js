import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Only fetch once if we have token, are authenticated, but don't have user data yet
    if (token && isAuthenticated && !user && !isLoading) {
      dispatch(fetchUserProfile());
    }
  }, []); // Empty dependency array - only run once on mount

  return { user, isAuthenticated, isLoading };
};








