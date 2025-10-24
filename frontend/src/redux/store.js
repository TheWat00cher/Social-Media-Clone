import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import postSlice from './slices/postSlice';
import userSlice from './slices/userSlice';
import messageSlice from './slices/messageSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postSlice,
    users: userSlice,
    messages: messageSlice,
  },
});

export default store;