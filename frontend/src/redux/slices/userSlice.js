import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const followUser = createAsyncThunk(
  'users/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/follow`);
      console.log('Follow API response:', response.data);
      return { 
        userId, 
        ...response.data.data 
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ search = '', page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users?search=${search}&page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    currentProfile: null,
    loading: false,
    followLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both possible response formats
        state.currentProfile = action.payload.user || action.payload;
        console.log('fetchUserById fulfilled:', action.payload);
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Follow user
      .addCase(followUser.pending, (state) => {
        state.followLoading = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.followLoading = false;
        console.log('Follow action payload:', action.payload);
        
        const { userId, isFollowing, followerCount, followingCount } = action.payload;
        
        // Update current profile if it's the same user
        if (state.currentProfile && state.currentProfile._id === userId) {
          state.currentProfile.isFollowing = isFollowing;
          state.currentProfile.followerCount = followerCount;
          if (state.currentProfile.stats) {
            state.currentProfile.stats.isFollowing = isFollowing;
            state.currentProfile.stats.followerCount = followerCount;
          }
        }
        
        // Update in users list
        const userIndex = state.users.findIndex(user => user._id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].isFollowing = isFollowing;
          state.users[userIndex].followerCount = followerCount;
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.followLoading = false;
        state.error = action.payload;
      })
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentProfile } = userSlice.actions;
export default userSlice.reducer;