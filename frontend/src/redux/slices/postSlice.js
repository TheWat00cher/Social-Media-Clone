import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts');
      // Backend returns: { status: 'success', message: '...', data: { data: [...], pagination: {...} } }
      return response.data.data.data; // Get the actual posts array
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('content', postData.content);
      if (postData.image) {
        formData.append('image', postData.image);
      }

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      console.log('Redux: Sending like request for post:', postId);
      const response = await api.post(`/posts/${postId}/like`);
      console.log('Redux: Like response:', response.data);
      return response.data.data.post;
    } catch (error) {
      console.error('Redux: Like error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/comment`, { content });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          if (!Array.isArray(state.posts)) {
            state.posts = [];
          }
          state.posts.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        console.log('Redux: likePost.fulfilled - payload:', action.payload);
        if (action.payload && action.payload._id && Array.isArray(state.posts)) {
          const index = state.posts.findIndex(post => post && post._id === action.payload._id);
          if (index !== -1) {
            console.log('Redux: Updating post at index:', index, 'with likes:', action.payload.likes?.length);
            state.posts[index] = action.payload;
          } else {
            console.log('Redux: Post not found in state for update');
          }
        } else {
          console.log('Redux: Invalid payload for likePost.fulfilled');
        }
        state.loading = false;
      })
      .addCase(likePost.rejected, (state, action) => {
        console.error('Redux: likePost.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (action.payload && action.payload.post && Array.isArray(state.posts)) {
          const index = state.posts.findIndex(post => post && post._id === action.payload.post._id);
          if (index !== -1) {
            state.posts[index] = action.payload.post;
          }
        }
      })
      
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        if (Array.isArray(state.posts)) {
          state.posts = state.posts.filter(post => post._id !== action.payload);
        }
      });
  },
});

export const { clearError } = postSlice.actions;
export default postSlice.reducer;