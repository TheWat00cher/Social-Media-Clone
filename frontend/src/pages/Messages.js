import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Divider,
  Badge,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Search as SearchIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  setCurrentConversation,
  addMessage,
  markMessagesAsRead,
} from '../redux/slices/messageSlice';
import { io } from 'socket.io-client';

const Messages = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { conversations, currentConversation, messages, loading, sendingMessage } = useSelector(
    (state) => state.messages
  );

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = React.useRef(null);

  // Initialize Socket.io
  useEffect(() => {
    if (user) {
      console.log('Initializing Socket.io connection...');
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('Socket.io connected:', newSocket.id);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
      });

      newSocket.emit('join', user._id || user.id);
      setSocket(newSocket);

      return () => {
        console.log('Disconnecting Socket.io...');
        newSocket.disconnect();
      };
    }
  }, [user]);

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (data) => {
        dispatch(addMessage({
          conversationId: data.conversationId,
          message: data.message
        }));
        scrollToBottom();
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket, dispatch]);

  // Fetch conversations on mount
  useEffect(() => {
    console.log('Fetching conversations...');
    dispatch(fetchConversations()).unwrap()
      .then(data => console.log('Conversations fetched:', data))
      .catch(error => console.error('Failed to fetch conversations:', error));
  }, [dispatch]);

  // Handle conversation from location state (when coming from Profile/Search)
  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === location.state.conversationId);
      if (conv) {
        dispatch(setCurrentConversation(conv));
      }
    }
  }, [location.state, conversations, dispatch]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      dispatch(fetchMessages(currentConversation._id));
      dispatch(markMessagesAsRead(currentConversation._id));
      
      // Join conversation room
      if (socket) {
        socket.emit('joinConversation', currentConversation._id);
      }
    }

    return () => {
      if (socket && currentConversation) {
        socket.emit('leaveConversation', currentConversation._id);
      }
    };
  }, [currentConversation, dispatch, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !currentConversation) {
      console.log('Cannot send message - missing text or conversation');
      return;
    }

    console.log('Sending message:', messageText, 'to conversation:', currentConversation._id);

    try {
      await dispatch(
        sendMessage({
          conversationId: currentConversation._id,
          content: messageText.trim(),
          messageType: 'text',
        })
      ).unwrap();

      setMessageText('');
      scrollToBottom();
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleConversationClick = (conversation) => {
    console.log('Conversation clicked:', conversation);
    dispatch(setCurrentConversation(conversation));
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    return conversation.participants.find(
      (p) => p._id !== user._id && p._id !== user.id
    );
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = getOtherParticipant(conv);
    if (!otherParticipant) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      otherParticipant.username?.toLowerCase().includes(searchLower) ||
      `${otherParticipant.firstName} ${otherParticipant.lastName}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const currentMessages = currentConversation
    ? messages[currentConversation._id] || []
    : [];

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pt: 2 }}>
      <Container maxWidth="xl">
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>
          {/* Conversations List */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
              }}
            >
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Messages
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#f8f9fa',
                    },
                  }}
                />
              </Box>

              {/* Conversations */}
              <List sx={{ overflow: 'auto', flexGrow: 1, p: 0 }}>
                {loading && conversations.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : filteredConversations.length === 0 ? (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No conversations yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Search for users and start chatting!
                    </Typography>
                  </Box>
                ) : (
                  filteredConversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation);
                    if (!otherParticipant) return null;

                    return (
                      <React.Fragment key={conversation._id}>
                        <ListItem
                          button
                          onClick={() => handleConversationClick(conversation)}
                          selected={currentConversation?._id === conversation._id}
                          sx={{
                            '&.Mui-selected': {
                              backgroundColor: 'primary.light',
                              '&:hover': {
                                backgroundColor: 'primary.light',
                              },
                            },
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              badgeContent={conversation.unreadCount || 0}
                              color="error"
                            >
                              <Avatar
                                sx={{
                                  bgcolor: 'primary.main',
                                  width: 50,
                                  height: 50,
                                }}
                              >
                                {otherParticipant.firstName?.charAt(0).toUpperCase() ||
                                  otherParticipant.username?.charAt(0).toUpperCase()}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {`${otherParticipant.firstName || ''} ${
                                  otherParticipant.lastName || ''
                                }`.trim() || otherParticipant.username}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {conversation.lastMessage?.content || 'No messages yet'}
                              </Typography>
                            }
                          />
                          <Typography variant="caption" color="text.secondary">
                            {conversation.lastMessageAt
                              ? formatTime(conversation.lastMessageAt)
                              : ''}
                          </Typography>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    );
                  })
                )}
              </List>
            </Paper>
          </Grid>

          {/* Chat Area */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
              }}
            >
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 45,
                        height: 45,
                        mr: 2,
                      }}
                    >
                      {getOtherParticipant(currentConversation)?.firstName
                        ?.charAt(0)
                        .toUpperCase() ||
                        getOtherParticipant(currentConversation)?.username
                          ?.charAt(0)
                          .toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {`${
                          getOtherParticipant(currentConversation)?.firstName || ''
                        } ${
                          getOtherParticipant(currentConversation)?.lastName || ''
                        }`.trim() ||
                          getOtherParticipant(currentConversation)?.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{getOtherParticipant(currentConversation)?.username}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Messages */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflow: 'auto',
                      p: 2,
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    {loading && currentMessages.length === 0 ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : currentMessages.length === 0 ? (
                      <Box sx={{ textAlign: 'center', p: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No messages yet. Start the conversation!
                        </Typography>
                      </Box>
                    ) : (
                      currentMessages.map((message) => {
                        const isSender =
                          message.sender._id === user._id ||
                          message.sender._id === user.id;

                        return (
                          <Box
                            key={message._id}
                            sx={{
                              display: 'flex',
                              justifyContent: isSender ? 'flex-end' : 'flex-start',
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                maxWidth: '70%',
                                backgroundColor: isSender
                                  ? 'primary.main'
                                  : 'white',
                                color: isSender ? 'white' : 'text.primary',
                                borderRadius: 2,
                                p: 1.5,
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              <Typography variant="body1">
                                {message.content}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  opacity: 0.7,
                                  display: 'block',
                                  mt: 0.5,
                                }}
                              >
                                {new Date(message.createdAt).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Message Input */}
                  <Box
                    component="form"
                    onSubmit={handleSendMessage}
                    sx={{
                      p: 2,
                      borderTop: '1px solid #e0e0e0',
                      backgroundColor: 'white',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton color="primary">
                        <AttachFileIcon />
                      </IconButton>
                      <TextField
                        fullWidth
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        disabled={sendingMessage}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                          },
                        }}
                      />
                      <IconButton
                        type="submit"
                        color="primary"
                        disabled={!messageText.trim() || sendingMessage}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'action.disabledBackground',
                          },
                        }}
                      >
                        {sendingMessage ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          <SendIcon />
                        )}
                      </IconButton>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    p: 4,
                  }}
                >
                  <MessageIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Select a conversation
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Choose a conversation from the list to start messaging
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Messages;
