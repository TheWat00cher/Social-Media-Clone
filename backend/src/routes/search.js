const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');

// Search users
router.get('/users', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchQuery = q.trim();
    
    // Search users by username (case insensitive)
    const users = await User.find({
      username: { $regex: searchQuery, $options: 'i' },
      _id: { $ne: req.user.id } // Exclude current user
    })
    .select('username email followers following')
    .limit(20);

    // Add follow status and counts
    const usersWithFollowStatus = users.map(user => {
      const isFollowing = req.user.following?.includes(user._id) || false;
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        isFollowing,
        followerCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0
      };
    });

    res.json(usersWithFollowStatus);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search posts
router.get('/posts', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchQuery = q.trim();
    
    // Search posts by content (case insensitive)
    const posts = await Post.find({
      content: { $regex: searchQuery, $options: 'i' }
    })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .limit(30);

    res.json(posts);
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;