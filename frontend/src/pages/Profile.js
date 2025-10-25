import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { PersonAdd, PersonRemove, Edit, Favorite, Comment, Close, Delete, PhotoCamera, Message } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts, deletePost, likePost } from '../redux/slices/postSlice';
import { fetchUserById, followUser, clearCurrentProfile } from '../redux/slices/userSlice';
import { updateUser } from '../redux/slices/authSlice';
import { createConversation } from '../redux/slices/messageSlice';
import api from '../utils/api';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { posts, loading: postsLoading } = useSelector((state) => state.posts);
  const { currentProfile, followLoading } = useSelector((state) => state.users);
  
  // State for comments modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  
  // State for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // State for edit profile
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');

  // State for followers/following dialog
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  // Get server URL for image paths
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const serverUrl = apiBaseUrl.replace('/api', '');

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === currentUser?._id;
  const profileUser = isOwnProfile ? currentUser : currentProfile;
  
  // Debug logging
  console.log('Profile debug:', {
    userId,
    currentUserId: currentUser?._id,
    isOwnProfile,
    postsCount: posts?.length
  });

  // Check if current user is following this profile user
  const isFollowing = profileUser && currentUser && !isOwnProfile ? 
    currentUser.following?.includes(profileUser._id) || 
    profileUser.followers?.includes(currentUser._id) || 
    profileUser.isFollowing ||
    profileUser.stats?.isFollowing : false;

  // Filter posts by profile user - ensure we have both posts and profileUser
  const userPosts = posts?.filter(post => 
    post.author?._id === profileUser?._id || post.author?._id === profileUser?.id
  ) || [];

  // Debug posts to see image data
  console.log('All posts:', posts);
  console.log('User posts:', userPosts);
  console.log('Posts with images:', userPosts.filter(post => post.images && post.images.length > 0));

  useEffect(() => {
    console.log('Profile useEffect triggered. UserId:', userId, 'IsOwnProfile:', isOwnProfile);
    
    dispatch(fetchPosts());
    
    if (!isOwnProfile && userId) {
      console.log('Fetching user profile for userId:', userId);
      dispatch(fetchUserById(userId));
    }
    
    return () => {
      if (!isOwnProfile) {
        dispatch(clearCurrentProfile());
      }
    };
  }, [dispatch, userId, isOwnProfile]);

  // Debug current state
  console.log('Profile render - currentUser:', currentUser);
  console.log('Profile render - currentProfile:', currentProfile);
  console.log('Profile render - profileUser:', profileUser);
  console.log('Profile render - userPosts:', userPosts.length);

  const handleFollowToggle = async () => {
    if (profileUser && !isOwnProfile && currentUser) {
      try {
        console.log('Following user:', profileUser._id, 'Current follow status:', isFollowing);
        
        const result = await dispatch(followUser(profileUser._id)).unwrap();
        console.log('Follow result:', result);
        
        // Refresh the user data after follow/unfollow
        if (userId) {
          await dispatch(fetchUserById(userId));
        }
        
        // Also update the current user's following list
        // You might need to add a refresh current user action here
        
      } catch (error) {
        console.error('Follow/unfollow failed:', error);
      }
    }
  };

  const handleMessageClick = async () => {
    if (profileUser && !isOwnProfile && currentUser) {
      try {
        const result = await dispatch(createConversation({ participantId: profileUser._id })).unwrap();
        navigate('/messages', { state: { conversationId: result._id } });
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    }
  };

  const handleFollowersClick = async () => {
    setLoadingFollowers(true);
    setFollowersDialogOpen(true);
    try {
      const userId = profileUser._id || profileUser.id;
      const response = await api.get(`/users/${userId}/followers`);
      console.log('Followers response:', response.data);
      // Backend returns paginated response: { data: { data: [...], pagination: {...} } }
      setFollowersList(response.data.data?.data || response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch followers:', error);
      setFollowersList([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleFollowingClick = async () => {
    setLoadingFollowers(true);
    setFollowingDialogOpen(true);
    try {
      const userId = profileUser._id || profileUser.id;
      const response = await api.get(`/users/${userId}/following`);
      console.log('Following response:', response.data);
      // Backend returns paginated response: { data: { data: [...], pagination: {...} } }
      setFollowingList(response.data.data?.data || response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch following:', error);
      setFollowingList([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleUserClick = (userId) => {
    setFollowersDialogOpen(false);
    setFollowingDialogOpen(false);
    navigate(`/profile/${userId}`);
  };

  const handleCommentClick = (post, event) => {
    event.stopPropagation();
    setSelectedPost(post);
    setCommentsOpen(true);
  };

  const handleCloseComments = () => {
    setCommentsOpen(false);
    setSelectedPost(null);
  };

  const handleDeleteClick = (post, event) => {
    event.stopPropagation();
    setPostToDelete(post);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (postToDelete) {
      try {
        await dispatch(deletePost(postToDelete._id)).unwrap();
        setDeleteDialog(false);
        setPostToDelete(null);
        // Refresh posts after deletion
        dispatch(fetchPosts());
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
    setPostToDelete(null);
  };

  // Like handler
  const handleLike = async (postId) => {
    try {
      await dispatch(likePost(postId)).unwrap();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  // Edit Profile handlers
  const handleEditProfileOpen = () => {
    setEditFormData({
      username: profileUser?.username || '',
      firstName: profileUser?.firstName || '',
      lastName: profileUser?.lastName || '',
      bio: profileUser?.bio || '',
      email: profileUser?.email || '',
      phone: profileUser?.phone || ''
    });
    // Set preview with full URL
    const pictureUrl = profileUser?.profilePicture 
      ? `${serverUrl}${profileUser.profilePicture}` 
      : '';
    setProfilePicturePreview(pictureUrl);
    setProfilePicture(null);
    setEditError('');
    setEditProfileOpen(true);
  };

  const handleEditProfileClose = () => {
    setEditProfileOpen(false);
    setEditError('');
    setProfilePicture(null);
    setProfilePicturePreview('');
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfileSave = async () => {
    setEditLoading(true);
    setEditError('');
    
    try {
      console.log('=== Starting profile update ===');
      console.log('Edit form data:', editFormData);
      console.log('User ID:', currentUser._id);
      console.log('Profile picture:', profilePicture);
      
      // Create FormData if profile picture is being uploaded
      let response;
      if (profilePicture) {
        console.log('Uploading with profile picture...');
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
        Object.keys(editFormData).forEach(key => {
          if (editFormData[key] !== null && editFormData[key] !== undefined) {
            formData.append(key, editFormData[key]);
          }
        });
        
        // Log FormData contents
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
        
        response = await api.put(`/users/${currentUser._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        console.log('Updating without profile picture...');
        // Call API to update profile without image
        response = await api.put(`/users/${currentUser._id}`, editFormData);
      }
      
      console.log('Update successful! Response:', response.data);
      
      // Update user in Redux store
      dispatch(updateUser(response.data.data.user));
      
      // Force refresh the profile data
      const profileIdToRefresh = userId || currentUser._id;
      if (profileIdToRefresh) {
        dispatch(fetchUserById(profileIdToRefresh));
      }
      
      setEditProfileOpen(false);
      setEditLoading(false);
      setProfilePicture(null);
      setProfilePicturePreview('');
      
      console.log('=== Profile update complete ===');
    } catch (error) {
      console.error('=== Profile update failed ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      setEditError(error.response?.data?.message || error.message || 'Failed to update profile. Please try again.');
      setEditLoading(false);
    }
  };

  // Helper function to get gradient background for text posts
  const getGradientBackground = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    ];
    return gradients[index % gradients.length];
  };

  // Helper function to get proper image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // If imageUrl is an object, extract the URL property
    if (typeof imageUrl === 'object') {
      imageUrl = imageUrl.url || imageUrl.path || imageUrl.src || '';
    }
    
    // If still not a string, return empty
    if (typeof imageUrl !== 'string') return '';
    
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return `${serverUrl}${imageUrl}`;
    return `${serverUrl}/${imageUrl}`;
  };

  if (postsLoading && (!posts || posts.length === 0)) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography align="center">Loading...</Typography>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Profile Header */}
      {profileUser && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={profileUser?.profilePicture ? `${serverUrl}${profileUser.profilePicture}` : ''}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mr: 3, 
                  fontSize: '2.5rem',
                  bgcolor: 'primary.main',
                  border: '4px solid white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                {profileUser?.firstName?.charAt(0).toUpperCase() || profileUser?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                  {`${profileUser?.firstName || ''} ${profileUser?.lastName || ''}`.trim() || profileUser?.username}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  @{profileUser?.username}
                </Typography>
                {profileUser?.bio && (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                    {profileUser.bio}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {isOwnProfile ? (
                  <Button 
                    variant="outlined" 
                    startIcon={<Edit />}
                    onClick={handleEditProfileOpen}
                    sx={{ 
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? "outlined" : "contained"}
                      startIcon={isFollowing ? <PersonRemove /> : <PersonAdd />}
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      sx={{
                        minWidth: 120,
                        bgcolor: isFollowing ? 'transparent' : 'primary.main',
                        color: isFollowing ? 'primary.main' : 'white',
                        borderColor: 'primary.main',
                        '&:hover': {
                          bgcolor: isFollowing ? 'primary.main' : 'primary.dark',
                          color: 'white'
                        }
                      }}
                    >
                      {followLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Message />}
                      onClick={handleMessageClick}
                      sx={{
                        minWidth: 120,
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
                  </>
                )}
              </Box>
            </Box>
            
            <Grid container spacing={3} sx={{ textAlign: 'center', mt: 2 }}>
              <Grid item xs={4}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {userPosts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Posts
                </Typography>
              </Grid>
              <Grid 
                item 
                xs={4} 
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 1 } }}
                onClick={handleFollowersClick}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {profileUser?.followerCount || profileUser?.followers?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Followers
                </Typography>
              </Grid>
              <Grid 
                item 
                xs={4} 
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 1 } }}
                onClick={handleFollowingClick}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {profileUser?.followingCount || profileUser?.following?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Following
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ mb: 4 }} />
      
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        {isOwnProfile ? 'My Posts' : 'Posts'}
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        {userPosts.length > 0 ? (
          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {userPosts.map((post, index) => (
              <Grid item sx={{ width: '30%', minWidth: '280px' }} key={post._id}>
                <Card 
                  sx={{ 
                    height: '350px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                      '& .stats-overlay': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  {post.images && post.images.length > 0 ? (
                    <>
                      <Box sx={{ 
                        height: '80%', 
                        position: 'relative', 
                        overflow: 'hidden',
                        borderRadius: '12px 12px 0 0'
                      }}>
                        <CardMedia
                          component="img"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          image={getImageUrl(post.images[0])}
                          alt="Post"
                          onError={(e) => {
                            console.log('Image failed to load:', post.images[0]);
                            console.log('Image object structure:', post.images[0]);
                            console.log('Full image URL:', getImageUrl(post.images[0]));
                          }}
                        />
                      </Box>
                      <Box sx={{ 
                        height: '15%', 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        borderTop: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontSize: '0.85rem',
                            color: '#333'
                          }}
                        >
                          {post.content || 'Image post'}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: getGradientBackground(index),
                        p: 3,
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                        }
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        color="white"
                        sx={{
                          textAlign: 'center',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          fontWeight: 600,
                          lineHeight: 1.4,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          position: 'relative',
                          zIndex: 1
                        }}
                      >
                        {post.content}
                      </Typography>
                    </Box>
                  )}

                  {/* Stats overlay on hover */}
                  <Box
                    className="stats-overlay"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      opacity: 0,
                      transition: 'all 0.3s ease',
                      background: 'rgba(0,0,0,0.8)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      p: 1.5,
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      zIndex: 10,
                      pointerEvents: 'auto'
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5,
                        cursor: 'pointer',
                        p: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleLike(post._id);
                      }}
                    >
                      <Favorite sx={{ fontSize: 16, color: '#ff4757' }} />
                      <Typography variant="caption" fontWeight="bold">
                        {post.likes?.length || 0}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5,
                        cursor: 'pointer',
                        p: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                      onClick={(e) => handleCommentClick(post, e)}
                    >
                      <Comment sx={{ fontSize: 16, color: '#3742fa' }} />
                      <Typography variant="caption" fontWeight="bold">
                        {post.comments?.length || 0}
                      </Typography>
                    </Box>

                    {/* Delete button - only show on own profile */}
                    {isOwnProfile && (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          cursor: 'pointer',
                          p: 0.8,
                          borderRadius: 1,
                          transition: 'all 0.2s ease',
                          zIndex: 100,
                          '&:hover': {
                            backgroundColor: 'rgba(255,77,77,0.3)',
                            transform: 'scale(1.1)'
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          console.log('Delete icon clicked for post:', post._id);
                          setPostToDelete(post);
                          setDeleteDialog(true);
                        }}
                      >
                        <Delete sx={{ fontSize: 18, color: '#ff4d4d' }} />
                      </Box>
                    )}

                  </Box>
                  
                  {/* Hover overlay with stats */}
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      color: 'white'
                    }}
                  >
                    {/* Stats in center */}
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          ❤️ {post.likes?.length || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          💬 {post.comments?.length || 0}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Delete button in bottom-right - only show on own profile */}
                    {isOwnProfile && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          right: 12,
                          color: '#ffffff',
                          backgroundColor: '#d32f2f',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          zIndex: 50,
                          boxShadow: '0 3px 12px rgba(211, 47, 47, 0.4)',
                          '&:hover': {
                            backgroundColor: '#c62828',
                            transform: 'scale(1.15)',
                            boxShadow: '0 6px 20px rgba(211, 47, 47, 0.6)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPostToDelete(post);
                          setDeleteDialog(true);
                        }}
                      >
                        <Delete sx={{ fontSize: 22 }} />
                      </IconButton>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card sx={{ 
            textAlign: 'center', 
            py: 8,
            borderRadius: 2,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e4e6ea'
          }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isOwnProfile ? "Share your first post!" : "Check back later for new posts."}
            </Typography>
          </Card>
        )}
      </Box>
    </Container>
    
    {/* Comments Modal */}
    <Dialog 
      open={commentsOpen} 
      onClose={handleCloseComments}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" fontWeight="bold">
          Comments ({selectedPost?.comments?.length || 0})
        </Typography>
        <IconButton onClick={handleCloseComments} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        {selectedPost?.comments && selectedPost.comments.length > 0 ? (
          <List sx={{ p: 0 }}>
            {selectedPost.comments.map((comment, index) => (
              <ListItem key={index} sx={{ py: 2, px: 3 }}>
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#1976d2',
                      width: 40,
                      height: 40
                    }}
                  >
                    {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight="bold">
                      {comment.user?.username || 'Anonymous'}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {comment.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            py: 6
          }}>
            <Typography variant="body2" color="text.secondary">
              No comments yet
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <Dialog 
      open={deleteDialog} 
      onClose={handleDeleteCancel}
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '350px',
          margin: '16px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        color: 'white',
        px: 2,
        py: 1.5
      }}>
        <Delete sx={{ fontSize: 22 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Delete Post
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{
            width: 40,
            height: 40,
            backgroundColor: '#fff3cd',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography sx={{ fontSize: '18px' }}>⚠️</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.3 }}>
              Are you sure?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              This action cannot be undone.
            </Typography>
          </Box>
        </Box>
        
        {postToDelete && (
          <Box sx={{ 
            p: 1.5, 
            backgroundColor: '#f8f9fa', 
            borderRadius: 1.5,
            border: '1px dashed #dee2e6'
          }}>
            <Typography variant="body2" sx={{ 
              fontStyle: 'italic',
              color: 'text.secondary',
              lineHeight: 1.4,
              fontSize: '0.85rem'
            }}>
              "{postToDelete.content?.substring(0, 80)}{postToDelete.content?.length > 80 ? '...' : ''}"
            </Typography>
            {postToDelete.image && (
              <Typography variant="caption" color="primary" sx={{ 
                display: 'block', 
                mt: 0.5,
                fontWeight: 500,
                fontSize: '0.75rem'
              }}>
                📷 Image attachment
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 1.5, gap: 1 }}>
        <Button 
          onClick={handleDeleteCancel}
          variant="outlined"
          size="small"
          sx={{
            borderRadius: 1.5,
            px: 2,
            py: 0.5,
            fontWeight: 500,
            textTransform: 'none',
            borderColor: '#dee2e6',
            color: 'text.secondary',
            fontSize: '0.85rem',
            '&:hover': {
              borderColor: '#adb5bd',
              backgroundColor: '#f8f9fa'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleDeleteConfirm}
          variant="contained"
          size="small"
          sx={{
            borderRadius: 1.5,
            px: 2,
            py: 0.5,
            fontWeight: 500,
            textTransform: 'none',
            backgroundColor: '#dc3545',
            fontSize: '0.85rem',
            '&:hover': {
              backgroundColor: '#c82333'
            },
            boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>

    {/* Edit Profile Dialog */}
    <Dialog 
      open={editProfileOpen} 
      onClose={handleEditProfileClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Edit />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Edit Profile
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 4, pb: 3 }}>
        {editError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setEditError('')}>
            {editError}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
          {/* Profile Picture Upload */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2,
            py: 2
          }}>
            <Avatar
              src={profilePicturePreview}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid',
                borderColor: 'primary.main',
                boxShadow: 3
              }}
            >
              {!profilePicturePreview && profileUser?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Change Profile Picture
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Recommended: Square image, at least 200x200px
            </Typography>
          </Box>

          <Divider />

          <TextField
            name="username"
            label="Username"
            value={editFormData.username}
            onChange={handleEditFormChange}
            fullWidth
            required
            helperText="This will be visible to others"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              name="firstName"
              label="First Name"
              value={editFormData.firstName}
              onChange={handleEditFormChange}
              fullWidth
              required
              helperText="Visible to others"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <TextField
              name="lastName"
              label="Last Name"
              value={editFormData.lastName}
              onChange={handleEditFormChange}
              fullWidth
              required
              helperText="Visible to others"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
          
          <TextField
            name="bio"
            label="Bio"
            value={editFormData.bio}
            onChange={handleEditFormChange}
            fullWidth
            multiline
            rows={3}
            helperText="Tell others about yourself - Visible to others (Max 500 characters)"
            inputProps={{ maxLength: 500 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Private Information
            </Typography>
          </Divider>
          
          <TextField
            name="email"
            label="Email"
            type="email"
            value={editFormData.email}
            onChange={handleEditFormChange}
            fullWidth
            required
            helperText="Only you can see this"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <TextField
            name="phone"
            label="Phone Number"
            type="tel"
            value={editFormData.phone}
            onChange={handleEditFormChange}
            fullWidth
            helperText="Optional - Only you can see this"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button 
          onClick={handleEditProfileClose}
          variant="outlined"
          disabled={editLoading}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleEditProfileSave}
          variant="contained"
          disabled={editLoading}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
            }
          }}
        >
          {editLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Followers Dialog */}
    <Dialog 
      open={followersDialogOpen} 
      onClose={() => setFollowersDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Followers
          </Typography>
          <IconButton onClick={() => setFollowersDialogOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loadingFollowers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : followersList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No followers yet</Typography>
          </Box>
        ) : (
          <List>
            {followersList.map((follower) => (
              <ListItem
                key={follower._id}
                button
                onClick={() => handleUserClick(follower._id)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={follower.profilePicture ? `${serverUrl}${follower.profilePicture}` : ''}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {follower.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {follower.firstName && follower.lastName 
                        ? `${follower.firstName} ${follower.lastName}`
                        : follower.username
                      }
                    </Typography>
                  }
                  secondary={`@${follower.username}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>

    {/* Following Dialog */}
    <Dialog 
      open={followingDialogOpen} 
      onClose={() => setFollowingDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Following
          </Typography>
          <IconButton onClick={() => setFollowingDialogOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loadingFollowers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : followingList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">Not following anyone yet</Typography>
          </Box>
        ) : (
          <List>
            {followingList.map((following) => (
              <ListItem
                key={following._id}
                button
                onClick={() => handleUserClick(following._id)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={following.profilePicture ? `${serverUrl}${following.profilePicture}` : ''}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {following.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {following.firstName && following.lastName 
                        ? `${following.firstName} ${following.lastName}`
                        : following.username
                      }
                    </Typography>
                  }
                  secondary={`@${following.username}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>

    </>
  );
};

export default Profile;