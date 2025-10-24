import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      return { user, token };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      const detailedErrors = error.response?.data?.errors;
      
      // If there are detailed errors, format them nicely
      if (detailedErrors && Array.isArray(detailedErrors)) {
        const errorList = detailedErrors.map(e => e.message).join('. ');
        return rejectWithValue(errorList);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password, firstName, lastName }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', {
        username, email, password, firstName, lastName
      });
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      return { user, token };
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      const detailedErrors = error.response?.data?.errors;
      
      // If there are detailed errors, format them nicely
      if (detailedErrors && Array.isArray(detailedErrors)) {
        const errorList = detailedErrors.map(e => e.message).join('. ');
        return rejectWithValue(errorList);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        return response.data.data.user;
      }
      return rejectWithValue('No token found');
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Failed to load user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true,
    error: null,
    showWelcome: false,
    isNewUser: false,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.showWelcome = false;
      state.isNewUser = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    stopLoading: (state) => {
      state.loading = false;
    },
    hideWelcome: (state) => {
      state.showWelcome = false;
      state.isNewUser = false;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.showWelcome = true;
        state.isNewUser = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.showWelcome = true;
        state.isNewUser = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearError, stopLoading, hideWelcome, updateUser } = authSlice.actions;
export default authSlice.reducer;