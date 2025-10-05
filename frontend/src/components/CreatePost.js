import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../redux/slices/postSlice';

const CreatePost = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() || image) {
      const postData = {
        content: content.trim(),
        image
      };
      dispatch(createPost(postData));
      setContent('');
      setImage(null);
      setImagePreview(null);
    }
  };

  return (
    <Card sx={{ 
      mb: 3, 
      maxWidth: 600, 
      mx: 'auto',
      borderRadius: 2,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e4e6ea'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main',
            width: 44,
            height: 44,
            fontSize: '1.1rem',
            fontWeight: 600
          }}>
            {user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={`What's on your mind, ${user?.firstName || 'User'}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="outlined"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f0f2f5',
                  border: 'none',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: '2px solid #1877f2',
                  },
                },
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  padding: '12px 16px',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#65676b',
                  opacity: 1,
                },
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                component="label"
                startIcon={<PhotoCamera />}
                variant="outlined"
                size="medium"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: '#e4e6ea',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(24, 119, 242, 0.04)',
                    color: 'primary.main'
                  }
                }}
              >
                Add Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!content.trim() && !image}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 2px 4px rgba(24, 119, 242, 0.3)'
                  },
                  '&:disabled': {
                    backgroundColor: '#e4e6ea',
                    color: '#8a8d91'
                  }
                }}
              >
                Post
              </Button>
            </Box>
            
            {/* Image Preview */}
            {imagePreview && (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'cover', 
                    borderRadius: '8px' 
                  }}
                />
                <IconButton
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.8)',
                    }
                  }}
                  size="small"
                >
                  <Close />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePost;