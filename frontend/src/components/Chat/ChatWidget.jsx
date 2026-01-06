import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Fab,
  Fade,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(`session_${Date.now()}`);
  const userId = useRef(`user_${Math.random().toString(36).substr(2, 9)}`);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to WebSocket
  useEffect(() => {
    if (isOpen && !isConnected) {
      connectWebSocket();
    }
    
    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect();
      }
    };
  }, [isOpen]);

  const connectWebSocket = () => {
    try {
      // Fix: Use factory function instead of socket instance
      const stompClient = Stomp.over(() => new SockJS('http://localhost:8083/ws'));
      
      // Disable debug logs (optional)
      stompClient.debug = () => {};
      
      stompClient.connect(
        {},
        () => {
          console.log('WebSocket Connected');
          setIsConnected(true);
          
          // Subscribe to public topic
          stompClient.subscribe('/topic/public', (message) => {
            const receivedMessage = JSON.parse(message.body);
            console.log('Received message:', receivedMessage);
            
            // Add message to state
            setMessages((prev) => [...prev, {
              id: receivedMessage.id,
              content: receivedMessage.content,
              sender: receivedMessage.sender,
              timestamp: receivedMessage.timestamp
            }]);
            
            // Stop typing indicator if AI responds
            if (receivedMessage.sender === 'AI') {
              setIsTyping(false);
            }
          });
          
          // Send welcome message from AI
          setTimeout(() => {
            setMessages([{
              id: 'welcome',
              content: 'Hello! Welcome to Sri-Tel Customer Support. How can I assist you today?',
              sender: 'AI',
              timestamp: new Date().toISOString()
            }]);
          }, 500);
        },
        (error) => {
          console.error('WebSocket connection error:', error);
          setIsConnected(false);
          
          // Retry connection after 3 seconds
          setTimeout(() => {
            if (isOpen) {
              connectWebSocket();
            }
          }, 3000);
        }
      );
      
      stompClientRef.current = stompClient;
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !stompClientRef.current || !stompClientRef.current.connected) {
      return;
    }

    const messagePayload = {
      content: inputMessage.trim(),
      userId: userId.current,
      sessionId: sessionId.current
    };

    try {
      // Send message to server
      stompClientRef.current.send('/app/chat.sendMessage', {}, JSON.stringify(messagePayload));
      
      // Show typing indicator
      setIsTyping(true);
      
      // Clear input
      setInputMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Widget Container */}
      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            width: 380,
            height: 550,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            zIndex: 1300,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'white', color: '#667eea' }}>
                <BotIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Sri-Tel Support
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {isConnected ? '🟢 Online' : '🔴 Connecting...'}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={toggleChat} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Container */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={msg.id || index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                {msg.sender === 'AI' && (
                  <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
                    <BotIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
                
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '75%',
                    bgcolor: msg.sender === 'USER' ? '#667eea' : 'white',
                    color: msg.sender === 'USER' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    wordWrap: 'break-word',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: '0.65rem',
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Paper>
                
                {msg.sender === 'USER' && (
                  <Avatar sx={{ bgcolor: '#764ba2', width: 32, height: 32 }}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
              </Box>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
                  <BotIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    AI is typing...
                  </Typography>
                </Paper>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input Area */}
          <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
              multiline
              maxRows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              sx={{
                bgcolor: '#667eea',
                color: 'white',
                '&:hover': {
                  bgcolor: '#764ba2',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Fade>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
          },
          zIndex: 1300,
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </>
  );
};

export default ChatWidget;
