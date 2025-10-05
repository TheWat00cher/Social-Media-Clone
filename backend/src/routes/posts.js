const express = require('express');
const { body } = require('express-validator');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  searchPosts
} = require('../controllers/postController');
const { auth, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { uploadSingle } = require('../utils/upload');

const router = express.Router();

// Validation rules
const createPostValidation = [
  body('content')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Post content cannot exceed 2000 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'followers', 'private'])
    .withMessage('Visibility must be public, followers, or private'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
];

const updatePostValidation = [
  body('content')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Post content cannot exceed 2000 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'followers', 'private'])
    .withMessage('Visibility must be public, followers, or private'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
];

const addCommentValidation = [
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// Routes
router.get('/', optionalAuth, getPosts);
router.get('/search', searchPosts);
router.post('/', auth, uploadSingle, createPostValidation, handleValidationErrors, createPost);
router.get('/:id', optionalAuth, getPost);
router.put('/:id', auth, updatePostValidation, handleValidationErrors, updatePost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, likePost);
router.post('/:id/comment', auth, addCommentValidation, handleValidationErrors, addComment);
router.delete('/:id/comment/:commentId', auth, deleteComment);

module.exports = router;