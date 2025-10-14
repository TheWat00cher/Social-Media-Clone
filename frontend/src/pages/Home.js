import React, { useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  CircularProgress, 
  Card, 
  Fab,
  Tooltip,
  Collapse
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPosts } from '../redux/slices/postSlice';
import { hideWelcome } from '../redux/slices/authSlice';
import PostCard from '../components/PostCard';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, loading, error } = useSelector((state) => state.posts);
  const { user, isAuthenticated, showWelcome } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPosts());
    }
  }, [dispatch, isAuthenticated]);

  // Hide welcome message after 4 seconds
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        dispatch(hideWelcome());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, dispatch]);

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
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', position: 'relative' }}>
      <Container maxWidth="md" sx={{ pt: 3, pb: 4 }}>
        {/* Welcome Header - Only shown after login/register */}
        <Collapse in={showWelcome}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4,
            p: 3,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            borderRadius: 3,
            color: 'white',
            boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)'
          }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              Welcome back, {user?.firstName || user?.username}! 👋
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                opacity: 0.9,
                fontWeight: 300
              }}
            >
              Discover what's happening in your network
            </Typography>
          </Box>
        </Collapse>
        
        {/* Error Message */}
        {error && (
          <Card sx={{ mb: 3, p: 2, backgroundColor: '#ffebee', borderLeft: '4px solid #f44336' }}>
            <Typography color="error" variant="body1" sx={{ fontWeight: 500 }}>
              ⚠️ Error loading posts: {error}
            </Typography>
          </Card>
        )}
        
        {/* Posts Feed */}
        <Box>
          {posts && posts.length > 0 ? (
            <>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600,
                  color: 'text.primary',
                  borderBottom: '2px solid #e0e0e0',
                  pb: 1
                }}
              >
                {/* 📰 Latest Posts ({posts.length}) */}
              </Typography>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </>
          ) : (
            <Card sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 4,
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '2px dashed #e0e0e0',
              backgroundColor: '#fafafa'
            }}>
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  fontWeight: 600
                }}
              >
                📱 No posts yet
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ mb: 3, opacity: 0.8 }}
              >
                Your feed is empty. Start following people or create your first post!
              </Typography>
              <Card
                sx={{
                  p: 2,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'inline-block',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
                onClick={() => navigate('/create-post')}
              >
                <Typography variant="button" sx={{ fontWeight: 600 }}>
                  ✨ Create Your First Post
                </Typography>
              </Card>
            </Card>
          )}
        </Box>
      </Container>

      {/* Floating Action Button for Create Post */}
      <Tooltip title="Create New Post" placement="left">
        <Fab
          color="primary"
          aria-label="create post"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 25px rgba(25, 118, 210, 0.4)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
          onClick={() => navigate('/create-post')}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default Home;