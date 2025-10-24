const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  unreadCount: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Validate participants
conversationSchema.pre('validate', function(next) {
  if (!this.isGroup && this.participants.length !== 2) {
    next(new Error('Direct conversation must have exactly 2 participants'));
  }
  if (this.isGroup && this.participants.length < 2) {
    next(new Error('Group conversation must have at least 2 participants'));
  }
  next();
});

// Static method to find or create conversation
conversationSchema.statics.findOrCreateConversation = async function(participant1, participant2) {
  let conversation = await this.findOne({
    isGroup: false,
    participants: { $all: [participant1, participant2] }
  }).populate('participants', 'username firstName lastName profilePicture')
    .populate('lastMessage');

  if (!conversation) {
    conversation = await this.create({
      participants: [participant1, participant2],
      isGroup: false
    });
    conversation = await conversation.populate('participants', 'username firstName lastName profilePicture');
  }

  return conversation;
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const userUnread = this.unreadCount.find(u => u.user.toString() === userId.toString());
  if (userUnread) {
    userUnread.count += 1;
  } else {
    this.unreadCount.push({ user: userId, count: 1 });
  }
  return this.save();
};

// Method to reset unread count for a user
conversationSchema.methods.resetUnreadCount = function(userId) {
  const userUnread = this.unreadCount.find(u => u.user.toString() === userId.toString());
  if (userUnread) {
    userUnread.count = 0;
  }
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
