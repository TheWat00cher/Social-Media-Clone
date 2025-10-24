const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user.id
  })
    .populate('participants', 'username firstName lastName profilePicture lastActive')
    .populate({
      path: 'lastMessage',
      select: 'content sender createdAt isRead messageType'
    })
    .sort({ lastMessageAt: -1 });

  // Add unread count for current user
  const conversationsWithUnread = conversations.map(conv => {
    const convObj = conv.toObject();
    const userUnread = conv.unreadCount.find(u => u.user.toString() === req.user.id);
    convObj.unreadCount = userUnread ? userUnread.count : 0;
    return convObj;
  });

  sendSuccess(res, 'Conversations retrieved successfully', { conversations: conversationsWithUnread });
});

// @desc    Get or create conversation with a user
// @route   POST /api/messages/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return sendError(res, 'User ID is required', 400);
  }

  if (userId === req.user.id) {
    return sendError(res, 'Cannot create conversation with yourself', 400);
  }

  // Check if user exists
  const otherUser = await User.findById(userId);
  if (!otherUser) {
    return sendError(res, 'User not found', 404);
  }

  const conversation = await Conversation.findOrCreateConversation(req.user.id, userId);

  sendSuccess(res, 'Conversation retrieved successfully', { conversation });
});

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversations/:conversationId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Check if user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user.id
  });

  if (!conversation) {
    return sendError(res, 'Conversation not found or access denied', 404);
  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({
    conversation: conversationId,
    isDeleted: false
  })
    .populate('sender', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Message.countDocuments({
    conversation: conversationId,
    isDeleted: false
  });

  // Mark messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user.id },
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  // Reset unread count
  await conversation.resetUnreadCount(req.user.id);

  sendSuccess(res, 'Messages retrieved successfully', {
    messages: messages.reverse(), // Reverse to show oldest first
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content, messageType = 'text' } = req.body;

  if (!conversationId || !content) {
    return sendError(res, 'Conversation ID and content are required', 400);
  }

  // Check if user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user.id
  });

  if (!conversation) {
    return sendError(res, 'Conversation not found or access denied', 404);
  }

  // Handle file upload if present
  let attachment = null;
  if (req.file && messageType !== 'text') {
    attachment = {
      url: `http://localhost:5000/uploads/${req.file.filename}`,
      publicId: req.file.filename,
      fileName: req.file.originalname,
      fileSize: req.file.size
    };
  }

  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: req.user.id,
    content,
    messageType,
    attachment
  });

  // Update conversation
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();

  // Increment unread count for other participants
  for (const participantId of conversation.participants) {
    if (participantId.toString() !== req.user.id) {
      await conversation.incrementUnreadCount(participantId);
    }
  }

  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'username firstName lastName profilePicture');

  // Emit real-time message via Socket.io
  const io = req.app.get('io');
  const connectedUsers = req.app.get('connectedUsers');

  for (const participantId of conversation.participants) {
    if (participantId.toString() !== req.user.id) {
      const recipientSocketId = connectedUsers.get(participantId.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', {
          message: populatedMessage,
          conversationId: conversationId
        });
      }
    }
  }

  sendSuccess(res, 'Message sent successfully', { message: populatedMessage }, 201);
});

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    return sendError(res, 'Message not found', 404);
  }

  // Only sender can delete
  if (message.sender.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to delete this message', 403);
  }

  await message.softDelete();

  // Emit real-time delete via Socket.io
  const io = req.app.get('io');
  const connectedUsers = req.app.get('connectedUsers');

  const conversation = await Conversation.findById(message.conversation);
  for (const participantId of conversation.participants) {
    const recipientSocketId = connectedUsers.get(participantId.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('messageDeleted', {
        messageId: message._id,
        conversationId: message.conversation
      });
    }
  }

  sendSuccess(res, 'Message deleted successfully');
});

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:conversationId
// @access  Private
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  // Check if user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user.id
  });

  if (!conversation) {
    return sendError(res, 'Conversation not found or access denied', 404);
  }

  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user.id },
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  await conversation.resetUnreadCount(req.user.id);

  sendSuccess(res, 'Messages marked as read');
});

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user.id
  });

  let totalUnread = 0;
  for (const conv of conversations) {
    const userUnread = conv.unreadCount.find(u => u.user.toString() === req.user.id);
    if (userUnread) {
      totalUnread += userUnread.count;
    }
  }

  sendSuccess(res, 'Unread count retrieved', { unreadCount: totalUnread });
});

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  markMessagesAsRead,
  getUnreadCount
};
