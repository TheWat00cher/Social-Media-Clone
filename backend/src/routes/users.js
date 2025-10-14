const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  followUser,
  getUserFollowers,
  getUserFollowing,
  getSuggestedUsers,
  searchUsers
} = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');
const { upload } = require('../utils/upload');

const router = express.Router();

// Routes
router.get('/', optionalAuth, getUsers);
router.get('/suggestions', auth, getSuggestedUsers);
router.get('/search', searchUsers);
router.get('/:id', optionalAuth, getUserById);
router.put('/:id', auth, upload.single('profilePicture'), updateUser);
router.post('/:id/follow', auth, followUser);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);

module.exports = router;