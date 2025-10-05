const express = require('express');
const {
  getUsers,
  getUserById,
  followUser,
  getUserFollowers,
  getUserFollowing,
  getSuggestedUsers,
  searchUsers
} = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Routes
router.get('/', optionalAuth, getUsers);
router.get('/suggestions', auth, getSuggestedUsers);
router.get('/search', searchUsers);
router.get('/:id', optionalAuth, getUserById);
router.post('/:id/follow', auth, followUser);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);

module.exports = router;