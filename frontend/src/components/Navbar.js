import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e4e6ea'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            cursor: 'pointer', 
            fontWeight: 700,
            color: 'primary.main',
            fontSize: { xs: '1.5rem', md: '1.75rem' }
          }}
          onClick={() => navigate('/')}
        >
          SocialConnect
        </Typography>
        
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/search')}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(24, 119, 242, 0.08)',
                  color: 'primary.main'
                }
              }}
            >
              <SearchIcon />
            </IconButton>
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/create-post')}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(24, 119, 242, 0.08)',
                  color: 'primary.main'
                }
              }}
            >
              <AddIcon />
            </IconButton>
            <Button 
              color="inherit" 
              onClick={() => navigate('/profile')}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(24, 119, 242, 0.08)',
                  color: 'primary.main'
                },
                borderRadius: 2,
                px: 2
              }}
            >
              Profile
            </Button>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                cursor: 'pointer',
                backgroundColor: 'primary.main',
                fontSize: '0.9rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
              onClick={() => navigate('/profile')}
            >
              {user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.08)',
                  color: 'error.main'
                },
                borderRadius: 2,
                px: 2
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(24, 119, 242, 0.08)',
                  color: 'primary.main'
                },
                borderRadius: 2,
                px: 2
              }}
            >
              Login
            </Button>
            <Button 
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 4px rgba(24, 119, 242, 0.3)'
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;