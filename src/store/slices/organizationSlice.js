import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { organizationApi } from '../../lib/api';

// Async thunks
export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getAll();
      // Return only the data to avoid serialization issues with headers
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organizations');
    }
  }
);

export const fetchOrganizationById = createAsyncThunk(
  'organizations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organization');
    }
  }
);

export const createOrganization = createAsyncThunk(
  'organizations/create',
  async (organizationData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.create(organizationData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create organization');
    }
  }
);

export const updateOrganization = createAsyncThunk(
  'organizations/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await organizationApi.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update organization');
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  'organizations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await organizationApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete organization');
    }
  }
);

const initialState = {
  organizations: [],
  currentOrganization: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
};

const organizationSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.isLoading = false;
        // Backend returns { success: true, message: "...", data: [...], timestamp: "..." }
        state.organizations = action.payload.data || [];
        state.totalCount = action.payload.data?.length || 0;
        state.totalPages = Math.ceil(state.totalCount / 10) || 1; // Assuming 10 items per page
        state.error = null;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch organization by ID
      .addCase(fetchOrganizationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrganization = action.payload;
        state.error = null;
      })
      .addCase(fetchOrganizationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create organization
      .addCase(createOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        // The backend returns data wrapped in a data property
        const newOrganization = action.payload;
        if (newOrganization) {
          state.organizations.unshift(newOrganization);
          state.totalCount += 1;
        }
        state.error = null;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update organization
      .addCase(updateOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.organizations.findIndex(org => org._id === action.payload._id);
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
        if (state.currentOrganization && state.currentOrganization._id === action.payload._id) {
          state.currentOrganization = action.payload;
        }
        state.error = null;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete organization
      .addCase(deleteOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizations = state.organizations.filter(org => org._id !== action.payload);
        state.totalCount -= 1;
        if (state.currentOrganization && state.currentOrganization._id === action.payload) {
          state.currentOrganization = null;
        }
        state.error = null;
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentOrganization, setCurrentPage } = organizationSlice.actions;
export default organizationSlice.reducer;