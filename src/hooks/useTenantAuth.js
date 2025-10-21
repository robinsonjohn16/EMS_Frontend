import { useSelector } from 'react-redux';

export const useTenantAuth = () => {
  const { user, isAuthenticated, isLoading, error, token } = useSelector((state) => state.tenantAuth);

  // Helper functions for role checking
  const hasRole = (role) => {
    return user?.role === role;
  };

  const isManager = () => {
    return hasRole('manager');
  };

  const isHR = () => {
    return hasRole('hr');
  };

  const isHROrManager = () => {
    return hasRole('hr') || hasRole('manager');
  };

  return { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    token,
    hasRole,
    isManager,
    isHR,
    isHROrManager
  };
};