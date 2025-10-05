const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification must have a recipient']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification must have a sender']
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'share', 'mention', 'post'],
    required: [true, 'Notification type is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [200, 'Message cannot exceed 200 characters']
  },
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  relatedComment: {
    type: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const { recipient, sender, type, message, relatedPost, relatedComment } = data;
  
  // Don't create notification for self-actions
  if (recipient.toString() === sender.toString()) {
    return null;
  }
  
  // Check if similar notification already exists
  const existingNotification = await this.findOne({
    recipient,
    sender,
    type,
    relatedPost,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
  });
  
  if (existingNotification) {
    return existingNotification;
  }
  
  return this.create({
    recipient,
    sender,
    type,
    message,
    relatedPost,
    relatedComment
  });
};

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);