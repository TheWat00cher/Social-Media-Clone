const express = require('express');
const { upload } = require('../utils/upload');
const { auth } = require('../middleware/auth');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'No image file provided', 400);
  }

  const imageData = {
    url: req.file.path,
    publicId: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  };

  sendSuccess(res, 'Image uploaded successfully', { image: imageData });
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return sendError(res, 'No image files provided', 400);
  }

  const images = req.files.map(file => ({
    url: file.path,
    publicId: file.filename,
    originalName: file.originalname,
    size: file.size
  }));

  sendSuccess(res, 'Images uploaded successfully', { images });
});

// Routes
router.post('/image', auth, upload.single('image'), uploadImage);
router.post('/images', auth, upload.array('images', 5), uploadImages);

module.exports = router;