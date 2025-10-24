import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Box,
  Collapse,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Comment, 
  Share, 
  Send,
  Link,
  Facebook,
  Twitter,
  WhatsApp,
  Delete,
  MoreVert,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { likePost, addComment, deletePost } from '../redux/slices/postSlice';

const PostCard = ({ post, sx, showDelete = false, ...otherProps }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Helper function to ensure proper image URL format
  const getImageUrl = (url) => {
    if (!url) return '';
    // If URL already starts with http, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If URL starts with uploads/, add the server prefix
    if (url.startsWith('uploads/')) {
      return `http://localhost:5000/${url}`;
    }
    // If URL doesn't start with uploads/, assume it needs the full path
    return `http://localhost:5000/uploads/${url}`;
  };

  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [optimisticLiked, setOptimisticLiked] = useState(null); // For immediate UI feedback

  // Reset optimistic state when post data changes (server response received)
  useEffect(() => {
    if (optimisticLiked !== null && optimisticLiked === post.isLiked) {
      setOptimisticLiked(null);
    }
  }, [post.isLiked, optimisticLiked]);
  const [shareAnchor, setShareAnchor] = useState(null);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const handleLike = async () => {
    if (!user) {
      console.log('User not logged in, cannot like post');
      return;
    }

    console.log('Clicking like on post:', post._id);
    console.log('Current liked state:', getCurrentLikedState());
    console.log('Current likes count:', post.likes?.length || 0);
    
    // Optimistic update for immediate UI feedback
    const newLikedState = !getCurrentLikedState();
    setOptimisticLiked(newLikedState);
    
    try {
      const result = await dispatch(likePost(post._id)).unwrap();
      console.log('Like action completed successfully:', result);
      // Keep the optimistic state until the component re-renders with new data
      // The optimistic state will be reset when the post data is updated
    } catch (error) {
      console.error('Failed to like post:', error);
      // Revert optimistic update on error
      setOptimisticLiked(null);
    }
  };

  // Helper function to get current liked state
  const getCurrentLikedState = () => {
    if (optimisticLiked !== null) {
      return optimisticLiked;
    }
    // Check if current user has liked this post
    if (user && post.likes && Array.isArray(post.likes)) {
      const userLiked = post.likes.some(like => 
        like.user === user._id || 
        like.user === user.id ||
        like.user?._id === user._id ||
        like.user?._id === user.id
      );
      console.log('PostCard - Checking like status:', {
        postId: post._id,
        userId: user._id || user.id,
        likes: post.likes,
        userLiked,
        isLiked: post.isLiked
      });
      return userLiked;
    }
    // Fall back to isLiked property from backend
    return post.isLiked || false;
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (comment.trim()) {
      try {
        await dispatch(addComment({ postId: post._id, content: comment.trim() })).unwrap();
        setComment('');
        // The Redux state will be updated automatically through the fulfilled action
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const handleShareClick = (event) => {
    setShareAnchor(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchor(null);
  };

  const copyToClipboard = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setShowCopyAlert(true);
      handleShareClose();
    });
  };

  const shareToSocial = (platform) => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    const text = post.content ? post.content.substring(0, 100) + '...' : 'Check out this post!';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    handleShareClose();
  };

  const nativeShare = () => {
    if (navigator.share) {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      navigator.share({
        title: 'Check out this post on SocialConnect',
        text: post.content || 'Interesting post from SocialConnect',
        url: postUrl,
      });
    } else {
      copyToClipboard();
    }
    handleShareClose();
  };

  const handleMenuClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    dispatch(deletePost(post._id));
    setDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
  };

  // Check if current user can delete this post
  const canDelete = user && (user._id === post.author?._id || user.id === post.author?._id);

  return (
    <Card sx={{ 
      mb: 3, 
      maxWidth: 600, 
      mx: 'auto',
      borderRadius: 2,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e4e6ea',
      ...sx
    }} {...otherProps}>
      <CardHeader
        avatar={
          <Avatar sx={{ 
            bgcolor: 'primary.main',
            width: 44,
            height: 44,
            fontSize: '1.1rem',
            fontWeight: 600
          }}>
            {post.author?.firstName?.charAt(0).toUpperCase() || 
             post.author?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        }
        action={
          canDelete && showDelete && (
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          )
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            {`${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || post.author?.username}
          </Typography>
        }
        subheader={new Date(post.createdAt).toLocaleDateString()}
      />
      
      <CardContent>
        <Typography variant="body1" color="text.primary">
          {post.content}
        </Typography>
        {post.images && post.images.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <img 
              src={getImageUrl(post.images[0].url)}
              alt={post.images[0].description || "Post"} 
              style={{ 
                width: '100%', 
                borderRadius: '8px', 
                maxHeight: '500px', 
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Box>
        )}
      </CardContent>
      
      <CardActions 
        disableSpacing 
        sx={{ 
          px: 2, 
          py: 1,
          borderTop: '1px solid #e4e6ea',
          display: 'flex',
          justifyContent: 'space-around'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <IconButton 
            onClick={handleLike} 
            color={getCurrentLikedState() ? 'error' : 'default'}
            sx={{
              '&:hover': {
                backgroundColor: getCurrentLikedState() ? 'rgba(244, 67, 54, 0.08)' : 'rgba(0, 0, 0, 0.04)'
              },
              color: getCurrentLikedState() ? '#f44336' : '#65676b'
            }}
          >
            {getCurrentLikedState() ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <Typography 
            variant="body2" 
            sx={{ 
              ml: 0.5, 
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            {post.likeCount || post.likes?.length || 0}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <IconButton 
            onClick={handleComment}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(24, 119, 242, 0.08)',
                color: 'primary.main'
              },
              color: '#65676b'
            }}
          >
            <Comment />
          </IconButton>
          <Typography 
            variant="body2" 
            sx={{ 
              ml: 0.5, 
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            {post.commentCount || post.comments?.length || 0}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <IconButton 
            onClick={handleShareClick}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                color: 'success.main'
              },
              color: '#65676b'
            }}
          >
            <Share />
          </IconButton>
        </Box>
      </CardActions>

      {/* Share Menu */}
      <Menu
        anchorEl={shareAnchor}
        open={Boolean(shareAnchor)}
        onClose={handleShareClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={nativeShare}>
          <Share sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={copyToClipboard}>
          <Link sx={{ mr: 1 }} />
          Copy Link
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => shareToSocial('facebook')}>
          <Facebook sx={{ mr: 1 }} />
          Facebook
        </MenuItem>
        <MenuItem onClick={() => shareToSocial('twitter')}>
          <Twitter sx={{ mr: 1 }} />
          Twitter
        </MenuItem>
        <MenuItem onClick={() => shareToSocial('whatsapp')}>
          <WhatsApp sx={{ mr: 1 }} />
          WhatsApp
        </MenuItem>
      </Menu>

      {/* Comments Section */}
      <Collapse in={showComments} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Divider sx={{ mb: 2 }} />
          
          {/* Add Comment */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <TextField
              fullWidth
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
              size="small"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button 
              variant="contained" 
              onClick={handleAddComment}
              disabled={!comment.trim()}
              size="small"
            >
              <Send />
            </Button>
          </Box>

          {/* Comments List */}
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {(post.comments || []).map((comment, index) => (
              <ListItem key={comment._id || index} alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {comment.user?.firstName?.charAt(0).toUpperCase() || 
                     comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body2" component="span" fontWeight="bold">
                        {`${comment.user?.firstName || ''} ${comment.user?.lastName || ''}`.trim() || 
                         comment.user?.username}
                      </Typography>
                      <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Collapse>
      
      {/* Post Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteClick}>
          <Delete sx={{ mr: 1 }} />
          Delete Post
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Copy Alert */}
      <Snackbar
        open={showCopyAlert}
        autoHideDuration={3000}
        onClose={() => setShowCopyAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowCopyAlert(false)} severity="success">
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default PostCard;