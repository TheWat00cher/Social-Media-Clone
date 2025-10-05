const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, asyncHandler, getPagination, formatPaginationResponse } = require('../utils/helpers');

// @desc    Get all users with pagination and search
// @route   GET /api/users
// @access  Public
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

  let query = {};
  
  if (search) {
    query = {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    };
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -email')
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  const response = formatPaginationResponse(users, total, pageNum, limitNum);
  sendSuccess(res, 'Users retrieved successfully', response);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -email')
    .populate('followers', 'username firstName lastName profilePicture isVerified')
    .populate('following', 'username firstName lastName profilePicture isVerified');

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Add additional stats
  const userStats = {
    ...user.toObject(),
    stats: {
      followerCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing: req.user ? user.followers.some(follower => follower._id.toString() === req.user.id) : false
    }
  };

  sendSuccess(res, 'User retrieved successfully', { user: userStats });
});

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!userToFollow) {
    return sendError(res, 'User not found', 404);
  }

  if (userToFollow._id.toString() === currentUser._id.toString()) {
    return sendError(res, 'You cannot follow yourself', 400);
  }

  const isFollowing = currentUser.following.includes(userToFollow._id);

  if (isFollowing) {
    // Unfollow
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToFollow._id.toString()
    );
    userToFollow.followers = userToFollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToFollow.save();

    sendSuccess(res, 'User unfollowed successfully', {
      userId: userToFollow._id,
      isFollowing: false,
      followerCount: userToFollow.followers.length
    });
  } else {
    // Follow
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    // Create notification
    await Notification.createNotification({
      recipient: userToFollow._id,
      sender: currentUser._id,
      type: 'follow',
      message: `${currentUser.firstName} ${currentUser.lastName} started following you`
    });

    // Emit real-time notification
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const recipientSocketId = connectedUsers.get(userToFollow._id.toString());
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('notification', {
        type: 'follow',
        message: `${currentUser.firstName} ${currentUser.lastName} started following you`,
        sender: {
          _id: currentUser._id,
          username: currentUser.username,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          profilePicture: currentUser.profilePicture
        }
      });
    }

    sendSuccess(res, 'User followed successfully', {
      userId: userToFollow._id,
      isFollowing: true,
      followerCount: userToFollow.followers.length
    });
  }
});

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
const getUserFollowers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

  const user = await User.findById(req.params.id);
  
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  const total = user.followers.length;
  const followers = await User.find({ _id: { $in: user.followers } })
    .select('username firstName lastName profilePicture isVerified')
    .skip(skip)
    .limit(limitNum);

  const response = formatPaginationResponse(followers, total, pageNum, limitNum);
  sendSuccess(res, 'Followers retrieved successfully', response);
});

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
const getUserFollowing = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

  const user = await User.findById(req.params.id);
  
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  const total = user.following.length;
  const following = await User.find({ _id: { $in: user.following } })
    .select('username firstName lastName profilePicture isVerified')
    .skip(skip)
    .limit(limitNum);

  const response = formatPaginationResponse(following, total, pageNum, limitNum);
  sendSuccess(res, 'Following retrieved successfully', response);
});

// @desc    Get suggested users to follow
// @route   GET /api/users/suggestions
// @access  Private
const getSuggestedUsers = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const { limit = 5 } = req.query;

  // Get users that current user is not following and exclude self
  const suggestedUsers = await User.find({
    _id: { 
      $nin: [...currentUser.following, currentUser._id] 
    }
  })
  .select('username firstName lastName profilePicture isVerified followerCount')
  .sort({ followerCount: -1, createdAt: -1 })
  .limit(parseInt(limit));

  sendSuccess(res, 'Suggested users retrieved successfully', { users: suggestedUsers });
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 10 } = req.query;

  if (!searchTerm) {
    return sendError(res, 'Search term is required', 400);
  }

  const users = await User.searchUsers(searchTerm, parseInt(limit));

  sendSuccess(res, 'Search results retrieved successfully', { users });
});

module.exports = {
  getUsers,
  getUserById,
  followUser,
  getUserFollowers,
  getUserFollowing,
  getSuggestedUsers,
  searchUsers
};