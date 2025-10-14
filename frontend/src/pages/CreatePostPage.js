import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Add as AddIcon } from '@mui/icons-material';
import CreatePost from '../components/CreatePost';

const CreatePostPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ pt: 3, pb: 4 }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumbs 
          aria-label="breadcrumb" 
          sx={{ 
            mb: 3,
            '& .MuiBreadcrumbs-separator': {
              color: 'text.secondary'
            }
          }}
        >
          <Link
            component={RouterLink}
            to="/home"
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark'
              }
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Home
          </Link>
          <Typography 
            color="text.primary" 
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500
            }}
          >
            {/* <AddIcon sx={{ mr: 0.5, fontSize: 20 }} /> */}
            Create Post
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Share Your Story
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              fontWeight: 300
            }}
          >
            What's on your mind today?
          </Typography>
        </Paper>

        {/* Create Post Component */}
        <CreatePost 
          onPostCreated={() => {
            // Navigate back to home after successful post creation
            setTimeout(() => {
              navigate('/home');
            }, 1000);
          }}
        />

        {/* Tips Section */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef'
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              mb: 2
            }}
          >
            💡 Tips for Great Posts
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              <strong>Be authentic:</strong> Share genuine thoughts and experiences
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              <strong>Add visuals:</strong> Images make your posts more engaging
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              <strong>Keep it concise:</strong> Clear and brief messages work best
            </Typography>
            <Typography component="li" variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>Engage with others:</strong> Respond to comments and like other posts
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreatePostPage;