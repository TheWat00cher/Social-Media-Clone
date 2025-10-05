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
  ListItemText
} from '@mui/material';
import { PersonAdd, PersonRemove, Edit, Favorite, Comment, Close } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchPosts } from '../redux/slices/postSlice';
import { fetchUserById, followUser, clearCurrentProfile } from '../redux/slices/userSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { posts, loading: postsLoading } = useSelector((state) => state.posts);
  const { currentProfile, followLoading } = useSelector((state) => state.users);
  
  // State for comments modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === currentUser?._id;
  const profileUser = isOwnProfile ? currentUser : currentProfile;

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

  const handleCommentClick = (post, event) => {
    event.stopPropagation();
    setSelectedPost(post);
    setCommentsOpen(true);
  };

  const handleCloseComments = () => {
    setCommentsOpen(false);
    setSelectedPost(null);
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
    if (imageUrl.startsWith('/uploads/')) return `http://localhost:5000${imageUrl}`;
    return `http://localhost:5000/${imageUrl}`;
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
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    {profileUser.bio}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {isOwnProfile ? (
                  <Button 
                    variant="outlined" 
                    startIcon={<Edit />}
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
              <Grid item xs={4}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {profileUser?.followerCount || profileUser?.followers?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Followers
                </Typography>
              </Grid>
              <Grid item xs={4}>
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
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                    {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight="bold">
                      {comment.author?.username || 'Anonymous'}
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
    </>
  );
};

export default Profile;