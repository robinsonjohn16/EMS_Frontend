import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/api';

// Async thunk to initialize auth state from localStorage
export const initializeTenantAuth = createAsyncThunk(
  'tenantAuth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('tenantToken');
      const refreshToken = localStorage.getItem('tenantRefreshToken');
      const user = localStorage.getItem('tenantUser');
      
      if (!token) {
        return { user: null, token: null, refreshToken: null, isAuthenticated: false };
      }

      // If we have a token, try to fetch fresh user data
      const response = await apiClient.get('/subdomain/auth/profile');
      const freshUser = response.data.data;
      
      // Update localStorage with fresh user data
      localStorage.setItem('tenantUser', JSON.stringify(freshUser));
      
      return { 
        user: freshUser, 
        token, 
        refreshToken,
        isAuthenticated: true 
      };
    } catch (error) {
      // If token is invalid, clear everything
      localStorage.removeItem('tenantToken');
      localStorage.removeItem('tenantRefreshToken');
      localStorage.removeItem('tenantUser');
      return { user: null, token: null, refreshToken: null, isAuthenticated: false };
    }
  }
);

// Async thunks for tenant authentication
export const loginTenantUser = createAsyncThunk(
  'tenantAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/subdomain/auth/login', credentials);
      console.log('Login response:', response.data);
      
      // Extract tokens from the response data structure
      const responseData = response.data.data;
      const { accessToken, refreshToken, user } = responseData;
      
      // Store tokens in localStorage
      localStorage.setItem('tenantToken', accessToken);
      localStorage.setItem('tenantRefreshToken', refreshToken);
      localStorage.setItem('tenantUser', JSON.stringify(user));
      
      // Log for debugging
      console.log('Tenant login successful, tokens stored in localStorage');
      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);
      
      return { token: accessToken, refreshToken, user };
    } catch (error) {
      console.error('Tenant login failed:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutTenantUser = createAsyncThunk(
  'tenantAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/subdomain/auth/logout');
      localStorage.removeItem('tenantToken');
      localStorage.removeItem('tenantRefreshToken');
      localStorage.removeItem('tenantUser');
      return null;
    } catch (error) {
      localStorage.removeItem('tenantToken');
      localStorage.removeItem('tenantRefreshToken');
      localStorage.removeItem('tenantUser');
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const fetchTenantUserProfile = createAsyncThunk(
  'tenantAuth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/subdomain/auth/profile');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Helper function to get initial user from localStorage
const getInitialTenantUser = () => {
  try {
    const user = localStorage.getItem('tenantUser');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: null, // Don't initialize from localStorage directly
  token: null, // Don't initialize from localStorage directly
  isAuthenticated: false, // Start as false, will be set by initializeTenantAuth
  isLoading: false,
  error: null,
  isInitialized: false, // Track if we've attempted to initialize from localStorage
};

const tenantAuthSlice = createSlice({
  name: 'tenantAuth',
  initialState,
  reducers: {
    clearTenantError: (state) => {
      state.error = null;
    },
    setTenantCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('tenantToken', token);
      localStorage.setItem('tenantUser', JSON.stringify(user));
    },
    clearTenantCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('tenantToken');
      localStorage.removeItem('tenantUser');
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeTenantAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeTenantAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeTenantAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      })
      // Login
      .addCase(loginTenantUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginTenantUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginTenantUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logoutTenantUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutTenantUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutTenantUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Fetch Profile
      .addCase(fetchTenantUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTenantUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
        // Update localStorage with fresh user data
        localStorage.setItem('tenantUser', JSON.stringify(action.payload));
      })
      .addCase(fetchTenantUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTenantError, setTenantCredentials, clearTenantCredentials } = tenantAuthSlice.actions;
export default tenantAuthSlice.reducer;