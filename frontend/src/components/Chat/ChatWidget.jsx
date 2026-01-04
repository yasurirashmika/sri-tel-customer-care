import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, TextField, IconButton, Typography, List, ListItem,
  Avatar, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && !chatRoom) {
      initializeChat();
    }
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    setLoading(true);
    try {
      // Create chat room
      const room = await chatService.createChatRoom(user.userId);
      setChatRoom(room);

      // Load chat history
      const history = await chatService.getChatHistory(room.roomId);
      setMessages(history.map(msg => ({
        senderName: msg.senderName,
        content: msg.content,
        sentAt: new Date(msg.sentAt),
      })));

      // Connect WebSocket
      const client = chatService.connectWebSocket(room.roomId, (message) => {
        setMessages(prev => [...prev, {
          senderName: message.senderName,
          content: message.content,
          sentAt: new Date(),
        }]);
      });
      setStompClient(client);

      // Send join message
      setTimeout(() => {
        if (client && client.connected) {
          chatService.sendMessage(client, room.roomId, {
            senderId: user.userId,
            senderName: user.fullName,
            messageType: 'JOIN',
            content: `${user.fullName} joined the chat`,
          });
        }
      }, 1000);

    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && stompClient && chatRoom) {
      const message = {
        roomId: chatRoom.roomId,
        senderId: user.userId,
        senderName: user.fullName,
        messageType: 'CHAT',
        content: newMessage,
        sentAt: new Date(),
      };

      chatService.sendMessage(stompClient, chatRoom.roomId, message);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="chat"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpen(true)}
      >
        <ChatIcon />
      </Fab>

      {/* Chat Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { height: '600px', display: 'flex', flexDirection: 'column' }
        }}
      >
        {/* FIXED: Removed nested Typography. DialogTitle is already an h2. */}
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Customer Support Chat
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {messages.map((msg, index) => (
                <ListItem
                  key={index}
                  sx={{
                    flexDirection: 'column',
                    alignItems: msg.senderName === user.fullName ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      flexDirection: msg.senderName === user.fullName ? 'row-reverse' : 'row',
                      gap: 1,
                      maxWidth: '80%'
                    }}
                  >
                    <Avatar sx={{ bgcolor: msg.senderName === user.fullName ? 'primary.main' : 'secondary.main' }}>
                      {msg.senderName.charAt(0)}
                    </Avatar>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        bgcolor: msg.senderName === user.fullName ? 'primary.light' : 'grey.100',
                        color: msg.senderName === user.fullName ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {msg.senderName}
                      </Typography>
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                        {msg.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Paper>
                  </Box>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!chatRoom || loading}
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !chatRoom || loading}
          >
            <SendIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ChatWidget;