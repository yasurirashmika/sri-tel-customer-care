import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Typography, Paper, Card, CardContent,
  Chip, CircularProgress, Divider
} from '@mui/material';
import { 
  Notifications as NotificationIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import { notificationService } from '../../services/api';

const Notifications = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (user?.id) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getUserNotifications(user.id);
      if (res?.available && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'SUCCESS': return <SuccessIcon sx={{ color: '#4caf50' }} />;
      case 'WARNING': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'ERROR': return <ErrorIcon sx={{ color: '#f44336' }} />;
      default: return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'SUCCESS': return 'success';
      case 'WARNING': return 'warning';
      case 'ERROR': return 'error';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Sidebar />
          </Grid>
          
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 9 }}>
            {/* Header Banner */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, mb: 3, borderRadius: 3, 
                background: 'linear-gradient(to right, #1565c0, #42a5f5)', 
                color: '#fff',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight="bold">All Notifications</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  View all your notifications and updates
                </Typography>
              </Box>
              <NotificationIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Paper>

            {loading ? (
              <Box display="flex" justifyContent="center" p={5}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Card sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                <NotificationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No notifications</Typography>
                <Typography variant="body2" color="text.secondary">
                  You don't have any notifications at the moment.
                </Typography>
              </Card>
            ) : (
              <Box>
                {[...notifications].reverse().map((notif, index) => (
                  <Card 
                    key={notif.id} 
                    elevation={1}
                    sx={{ 
                      mb: 2, 
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 3 }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {/* Icon */}
                        <Box sx={{ mt: 0.5 }}>
                          {getTypeIcon(notif.type)}
                        </Box>
                        
                        {/* Content */}
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {notif.subject}
                            </Typography>
                            <Chip 
                              label={notif.type || 'INFO'} 
                              color={getTypeColor(notif.type)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {notif.message}
                          </Typography>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}
                            </Typography>
                            <Chip 
                              label={notif.status || 'UNREAD'} 
                              size="small"
                              sx={{ 
                                fontSize: '0.7rem',
                                height: 20,
                                bgcolor: notif.status === 'READ' ? '#e0e0e0' : '#e3f2fd',
                                color: notif.status === 'READ' ? '#666' : '#1976d2'
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Notifications;