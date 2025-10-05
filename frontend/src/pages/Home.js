import React, { useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Card } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../redux/slices/postSlice';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

const Home = () => {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((state) => state.posts);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPosts());
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <Box sx={{ 
        backgroundColor: 'background.default', 
        minHeight: '100vh',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ pt: 3, pb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ 
            mb: 4, 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Welcome back, {user?.firstName || user?.username}!
        </Typography>
        
        <CreatePost />
        
        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            Error loading posts: {error}
          </Typography>
        )}
        
        <Box sx={{ mt: 3 }}>
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          ) : (
            <Card sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 4,
              borderRadius: 3,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e4e6ea',
              backgroundColor: '#f8f9fa'
            }}>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  mb: 1,
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                No posts yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                Be the first to share something amazing!
              </Typography>
            </Card>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;