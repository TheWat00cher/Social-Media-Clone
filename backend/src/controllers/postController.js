const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, asyncHandler, getPagination, formatPaginationResponse } = require('../utils/helpers');

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, userId } = req.query;
  const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

  let query = { visibility: 'public' };
  
  // If userId is provided, get posts from that user
  if (userId) {
    query.author = userId;
  }
  
  // If user is authenticated, include posts from followed users
  if (req.user) {
    const user = await User.findById(req.user.id);
    const followingIds = user.following;
    
    query = {
      $or: [
        { visibility: 'public' },
        { author: { $in: [...followingIds, req.user.id] } }
      ]
    };
    
    if (userId) {
      query = { author: userId };
    }
  }

  const total = await Post.countDocuments(query);
  const posts = await Post.find(query)
    .populate('author', 'username firstName lastName profilePicture isVerified')
    .populate('comments.user', 'username firstName lastName profilePicture')
    .populate('likes.user', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Add user interaction data if authenticated
  const postsWithUserData = posts.map(post => {
    const postObj = post.toObject();
    if (req.user) {
      postObj.isLiked = post.isLikedBy(req.user.id);
      postObj.userLike = post.getLikeByUser(req.user.id);
    }
    return postObj;
  });

  const response = formatPaginationResponse(postsWithUserData, total, pageNum, limitNum);
  sendSuccess(res, 'Posts retrieved successfully', response);
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username firstName lastName profilePicture isVerified')
    .populate('comments.user', 'username firstName lastName profilePicture')
    .populate('comments.replies.user', 'username firstName lastName profilePicture')
    .populate('likes.user', 'username firstName lastName');

  if (!post) {
    return sendError(res, 'Post not found', 404);
  }

  // Check if post is private and user has access
  if (post.visibility === 'private' && (!req.user || post.author._id.toString() !== req.user.id)) {
    return sendError(res, 'Access denied', 403);
  }

  if (post.visibility === 'followers' && req.user) {
    const user = await User.findById(req.user.id);
    const isFollowing = user.following.includes(post.author._id);
    const isOwner = post.author._id.toString() === req.user.id;
    
    if (!isFollowing && !isOwner) {
      return sendError(res, 'Access denied', 403);
    }
  }

  // Add user interaction data if authenticated
  const postObj = post.toObject();
  if (req.user) {
    postObj.isLiked = post.isLikedBy(req.user.id);
    postObj.userLike = post.getLikeByUser(req.user.id);
  }

  sendSuccess(res, 'Post retrieved successfully', { post: postObj });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { content, tags, location, visibility } = req.body;
  
  // Handle uploaded image
  let images = [];
  if (req.file) {
    // Create full URL for locally stored image
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    images = [{
      url: imageUrl,
      publicId: req.file.filename, // Use filename as publicId for local storage
      description: content ? content.substring(0, 100) : 'User uploaded image'
    }];
  }

  if (!content && images.length === 0) {
    return sendError(res, 'Post must have content or images', 400);
  }

  const post = await Post.create({
    author: req.user.id,
    content,
    images,
    tags: tags ? JSON.parse(tags) : [],
    location,
    visibility: visibility || 'public'
  });

  const populatedPost = await Post.findById(post._id)
    .populate('author', 'username firstName lastName profilePicture isVerified');

  // Notify followers if post is public
  if (visibility === 'public' || visibility === 'followers') {
    const user = await User.findById(req.user.id);
    const followers = user.followers;

    // Create notifications for followers
    const notifications = followers.map(followerId => ({
      recipient: followerId,
      sender: req.user.id,
      type: 'post',
      message: `${user.firstName} ${user.lastName} shared a new post`,
      relatedPost: post._id
    }));

    await Notification.insertMany(notifications);

    // Emit real-time notifications
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    followers.forEach(followerId => {
      const recipientSocketId = connectedUsers.get(followerId.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('notification', {
          type: 'post',
          message: `${user.firstName} ${user.lastName} shared a new post`,
          sender: {
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture
          },
          relatedPost: post._id
        });
      }
    });
  }

  sendSuccess(res, 'Post created successfully', { post: populatedPost }, 201);
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return sendError(res, 'Post not found', 404);
  }

  // Check if user owns the post
  if (post.author.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to update this post', 403);
  }

  const { content, images, tags, location, visibility } = req.body;

  // Update fields
  if (content !== undefined) post.content = content;
  if (images !== undefined) post.images = images;
  if (tags !== undefined) post.tags = tags;
  if (location !== undefined) post.location = location;
  if (visibility !== undefined) post.visibility = visibility;

  await post.save();

  const updatedPost = await Post.findById(post._id)
    .populate('author', 'username firstName lastName profilePicture isVerified')
    .populate('comments.user', 'username firstName lastName profilePicture');

  sendSuccess(res, 'Post updated successfully', { post: updatedPost });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return sendError(res, 'Post not found', 404);
  }

  // Check if user owns the post
  if (post.author.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to delete this post', 403);
  }

  await Post.findByIdAndDelete(req.params.id);

  sendSuccess(res, 'Post deleted successfully');
});

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username firstName lastName profilePicture isVerified');

  if (!post) {
    return sendError(res, 'Post not found', 404);
  }

  const isLiked = post.isLikedBy(req.user.id);

  if (isLiked) {
    // Unlike
    await post.removeLike(req.user.id);
  } else {
    // Like
    await post.addLike(req.user.id);

    // Create notification if not own post
    if (post.author._id.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      
      await Notification.createNotification({
        recipient: post.author._id,
        sender: req.user.id,
        type: 'like',
        message: `${user.firstName} ${user.lastName} liked your post`,
        relatedPost: post._id
      });

      // Emit real-time notification
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      const recipientSocketId = connectedUsers.get(post.author._id.toString());
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('notification', {
          type: 'like',
          message: `${user.firstName} ${user.lastName} liked your post`,
          sender: {
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture
          },
          relatedPost: post._id
        });
      }
    }
  }

  // Reload the post to get updated data
  const updatedPost = await Post.findById(req.params.id)
    .populate('author', 'username firstName lastName profilePicture isVerified')
    .populate('comments.user', 'username firstName lastName profilePicture')
    .populate('likes.user', 'username firstName lastName');

  // Add user interaction data
  const postObj = updatedPost.toObject();
  postObj.isLiked = updatedPost.isLikedBy(req.user.id);
  postObj.likeCount = updatedPost.likes.length;
  postObj.commentCount = updatedPost.comments.length;

  sendSuccess(res, 'Post updated successfully', { post: postObj });
});

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    return sendError(res, 'Comment content is required', 400);
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return sendError(res, 'Post not found', 404);
  }

  const comment = {
    user: req.user.id,
    content,
    createdAt: new Date()
  };

  post.comments.push(comment);
  await post.save();

  // Create notification if not own post
  if (post.author.toString() !== req.user.id) {
    const user = await User.findById(req.user.id);
    
    await Notification.createNotification({
      recipient: post.author,
      sender: req.user.id,
      type: 'comment',
      message: `${user.firstName} ${user.lastName} commented on your post`,
      relatedPost: post._id,
      relatedComment: comment._id
    });

    // Emit real-time notification
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const recipientSocketId = connectedUsers.get(post.author.toString());
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('notification', {
        type: 'comment',
        message: `${user.firstName} ${user.lastName} commented on your post`,
        sender: {
          _id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture
        },
        relatedPost: post._id
      });
    }
  }

  const updatedPost = await Post.findById(post._id)
    .populate('author', 'username firstName lastName profilePicture isVerified')
    .populate('comments.user', 'username firstName lastName profilePicture')
    .populate('likes.user', 'username firstName lastName');

  // Add user interaction data
  const postObj = updatedPost.toObject();
  postObj.isLiked = updatedPost.isLikedBy(req.user.id);
  postObj.likeCount = updatedPost.likes.length;
  postObj.commentCount = updatedPost.comments.length;

  sendSuccess(res, 'Comment added successfully', {
    post: postObj
  }, 201);
});

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return sendError(res, 'Post not found', 404);
  }

  const comment = post.comments.id(req.params.commentId);

  if (!comment) {
    return sendError(res, 'Comment not found', 404);
  }

  // Check if user owns the comment or the post
  if (comment.user.toString() !== req.user.id && post.author.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to delete this comment', 403);
  }

  comment.remove();
  await post.save();

  sendSuccess(res, 'Comment deleted successfully', {
    commentCount: post.comments.length
  });
});

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Public
const searchPosts = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 20 } = req.query;

  if (!searchTerm) {
    return sendError(res, 'Search term is required', 400);
  }

  const posts = await Post.searchPosts(searchTerm, parseInt(limit));

  sendSuccess(res, 'Search results retrieved successfully', { posts });
});

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  searchPosts
};