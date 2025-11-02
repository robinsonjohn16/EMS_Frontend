import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/card';
import { toast } from 'sonner';
import { loginTenantUser, clearTenantError } from '../../store/slices/tenantAuthSlice';
import { fetchOrganizationBySubdomain, clearSubdomainError } from '../../store/slices/subdomainSlice';
import { getAssetUrl } from '../../lib/assets';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasFetched = useRef(false);
  const { isAuthenticated, error } = useSelector((state) => state.tenantAuth);
  const { organization, isLoading: orgLoading, error: orgError, isInitialized } = useSelector((state) => state.subdomain);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Clear any previous errors on mount
    dispatch(clearTenantError());
    dispatch(clearSubdomainError());
    
    // Only fetch organization once if not already initialized and not already fetched
    if (!isInitialized && !orgLoading && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchOrganizationBySubdomain());
    }
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    // Show error toast if organization fetch failed
    if (orgError) {
      toast.error(orgError);
    }
  }, [orgError]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      // Check if there's a saved path to redirect to
      const redirectPath = localStorage.getItem('redirectPath');
      if (redirectPath) {
        localStorage.removeItem('redirectPath'); // Clear it after use
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const resultAction = await dispatch(loginTenantUser(data));
      if (loginTenantUser.fulfilled.match(resultAction)) {
        toast.success('Logged in successfully');
      } else {
        toast.error(resultAction.payload || 'Login failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        {organization && (
          <CardHeader className="text-center">
            {organization.logo && (
              <img 
                src={getAssetUrl(organization.logo)} 
                alt={organization.name}
                className="h-16 mx-auto mb-4 object-contain"
              />
            )}
            <h2 className="text-2xl font-bold">{organization.name}</h2>
            <p className="text-gray-500">Login to your account</p>
          </CardHeader>
        )}
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-xs text-gray-500">
          {organization?.website ? (
            <a href={organization.website} target="_blank" rel="noreferrer" className="hover:underline">
              {organization.website}
            </a>
          ) : (
            <span>Welcome to {organization?.name || 'your organization'}</span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;