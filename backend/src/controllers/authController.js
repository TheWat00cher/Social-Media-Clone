const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Check if user exists
  const userExists = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (userExists) {
    return sendError(res, 'User with this email or username already exists', 400);
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName
  });

  if (user) {
    const token = generateToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    sendSuccess(res, 'User registered successfully', {
      user: userResponse,
      token
    }, 201);
  } else {
    sendError(res, 'Invalid user data', 400);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return sendError(res, 'Please provide email and password', 400);
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Update last active
  user.lastActive = new Date();
  await user.save();

  const token = generateToken(user._id);
  
  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  sendSuccess(res, 'Login successful', {
    user: userResponse,
    token
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('followers', 'username firstName lastName profilePicture')
    .populate('following', 'username firstName lastName profilePicture');

  sendSuccess(res, 'User profile retrieved successfully', { user });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'firstName', 'lastName', 'bio', 'dateOfBirth', 
    'location', 'website', 'isPrivate'
  ];
  
  const updates = {};
  
  // Only include allowed fields
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  sendSuccess(res, 'Profile updated successfully', { user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendError(res, 'Please provide current and new password', 400);
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    return sendError(res, 'Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccess(res, 'Password changed successfully');
});

// @desc    Delete account
// @route   DELETE /api/auth/me
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return sendError(res, 'Please provide your password to confirm deletion', 400);
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return sendError(res, 'Password is incorrect', 400);
  }

  // TODO: Add cleanup logic here (delete posts, remove from followers/following, etc.)
  
  await User.findByIdAndDelete(req.user.id);

  sendSuccess(res, 'Account deleted successfully');
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount
};