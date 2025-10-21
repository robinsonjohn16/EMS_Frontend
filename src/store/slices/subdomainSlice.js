import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/api';

// Async thunk for fetching organization by subdomain
export const fetchOrganizationBySubdomain = createAsyncThunk(
  'subdomain/fetchOrganization',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/subdomain/organization');
      return response.data.data.organization;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid organization subdomain');
    }
  }
);

const subdomainSlice = createSlice({
  name: 'subdomain',
  initialState: {
    organization: null,
    isLoading: false,
    error: null,
    isInitialized: false, // Track if we've already fetched the organization
  },
  reducers: {
    clearSubdomainError: (state) => {
      state.error = null;
    },
    resetSubdomain: (state) => {
      state.organization = null;
      state.isLoading = false;
      state.error = null;
      state.isInitialized = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizationBySubdomain.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationBySubdomain.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organization = action.payload;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(fetchOrganizationBySubdomain.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.organization = null;
        state.isInitialized = true;
      });
  },
});

export const { clearSubdomainError, resetSubdomain } = subdomainSlice.actions;
export default subdomainSlice.reducer;