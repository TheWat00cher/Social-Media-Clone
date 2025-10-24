import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Chip,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, PersonAdd, PersonRemove, Message } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { followUser } from '../redux/slices/userSlice';
import { createConversation } from '../redux/slices/messageSlice';

const Search = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('users'); // 'users' or 'posts'
  const [followingUserId, setFollowingUserId] = useState(null); // Track which user is being followed

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Searching for:', searchQuery, 'Type:', searchType);
      
      const response = await fetch(`http://localhost:5000/api/search/${searchType}?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Search response status:', response.status);
      const data = await response.json();
      console.log('Search response data:', data);
      
      if (response.ok) {
        setSearchResults(data);
      } else {
        console.error('Search failed:', data.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchType]);

  const handleFollowToggle = async (userId) => {
    setFollowingUserId(userId); // Set the specific user being followed
    try {
      await dispatch(followUser(userId)).unwrap();
      // Update the search results to reflect the new follow status
      setSearchResults(prev => prev.map(user => 
        user._id === userId 
          ? { 
              ...user, 
              isFollowing: !user.isFollowing,
              followerCount: user.isFollowing 
                ? (user.followerCount || 0) - 1 
                : (user.followerCount || 0) + 1
            }
          : user
      ));
    } catch (error) {
      console.error('Follow/unfollow failed:', error);
    } finally {
      setFollowingUserId(null); // Clear the following state
    }
  };

  const handleMessageClick = async (userId) => {
    try {
      const result = await dispatch(createConversation({ participantId: userId })).unwrap();
      navigate('/messages', { state: { conversationId: result._id } });
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const isFollowing = (user) => {
    return currentUser?.following?.includes(user._id) || user.isFollowing;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
      {/* Search Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Search
        </Typography>
        
        {/* Search Type Filters */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label="Users"
            clickable
            color={searchType === 'users' ? 'primary' : 'default'}
            onClick={() => setSearchType('users')}
            sx={{ mr: 1 }}
          />
          <Chip
            label="Posts"
            clickable
            color={searchType === 'posts' ? 'primary' : 'default'}
            onClick={() => setSearchType('posts')}
          />
        </Box>

        {/* Search Input */}
        <TextField
          fullWidth
          placeholder={`Search for ${searchType}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#f8f9fa'
            }
          }}
        />
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Search Results */}
      {!loading && searchResults.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {searchResults.length} {searchType} found
          </Typography>
          
          {searchType === 'users' ? (
            <Grid container spacing={2}>
              {searchResults.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user._id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2,
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }}
                        onClick={() => handleUserClick(user._id)}
                      >
                        {user.username?.charAt(0).toUpperCase()}
                      </Avatar>
                      
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => handleUserClick(user._id)}
                      >
                        {user.username}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        @{user.username}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {user.followerCount || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Followers
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {user.followingCount || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Following
                          </Typography>
                        </Box>
                      </Box>

                      {user._id !== currentUser?._id && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            variant={isFollowing(user) ? "outlined" : "contained"}
                            startIcon={isFollowing(user) ? <PersonRemove /> : <PersonAdd />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(user._id);
                            }}
                            disabled={followingUserId === user._id}
                            size="small"
                            sx={{
                              minWidth: 100,
                              bgcolor: isFollowing(user) ? 'transparent' : 'primary.main',
                              '&:hover': {
                                bgcolor: isFollowing(user) ? 'primary.main' : 'primary.dark',
                                color: 'white'
                              }
                            }}
                          >
                            {followingUserId === user._id ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              isFollowing(user) ? 'Unfollow' : 'Follow'
                            )}
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Message />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMessageClick(user._id);
                            }}
                            size="small"
                            sx={{
                              minWidth: 100,
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: 'primary.main',
                                color: 'white'
                              }
                            }}
                          >
                            Message
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Posts search results
            <Grid container spacing={3}>
              {searchResults.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post._id}>
                  <Card sx={{ cursor: 'pointer', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                          {post.author?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold">
                          {post.author?.username}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {post.content}
                      </Typography>
                      
                      {post.images && post.images.length > 0 && (
                        <Box
                          component="img"
                          src={`http://localhost:5000/${post.images[0]}`}
                          alt="Post"
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mb: 2
                          }}
                        />
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          ❤️ {post.likes?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          💬 {post.comments?.length || 0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* No Results */}
      {!loading && searchQuery.trim() && searchResults.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {searchType} found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try different keywords or check your spelling
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {!searchQuery.trim() && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Start searching
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find users and posts by typing in the search box above
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Search;