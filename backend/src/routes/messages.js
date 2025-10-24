const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload } = require('../utils/upload');
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  markMessagesAsRead,
  getUnreadCount
} = require('../controllers/messageController');

// All routes require authentication
router.use(auth);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:conversationId', getMessages);

// Message routes
router.post('/', upload.single('attachment'), sendMessage);
router.delete('/:messageId', deleteMessage);
router.put('/read/:conversationId', markMessagesAsRead);
router.get('/unread-count', getUnreadCount);

module.exports = router;
