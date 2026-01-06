import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/api'; 
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent,
  Button, Avatar, Divider, Popover, List, ListItem, ListItemText, Badge
} from '@mui/material';
import {
  Person as PersonIcon, Notifications as NotificationsIcon,
  PhoneAndroid as PhoneIcon, Email as EmailIcon,
  ReceiptLong as BillIcon, Payment as PaymentIcon,
  Settings as ServiceIcon, SupportAgent as SupportIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

// Import Layout Components
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // --- Notification Logic ---
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const lastDataRef = useRef(""); 
  const isInitialMount = useRef(true); // New: Track if this is the first render

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await notificationService.getUserNotifications(user.id);
      
      if (res?.available && Array.isArray(res.data)) {
        const currentDataString = JSON.stringify(res.data);
        
        if (lastDataRef.current !== currentDataString) {
          lastDataRef.current = currentDataString;
          setNotifications(res.data);
        }
      }
    } catch (err) {
      console.warn('Notification fetch failed:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    // 1. If it's the first time, wait a tiny bit to let the rest of the UI settle
    // This prevents the "synchronous" cascading render error
    if (isInitialMount.current) {
      const timeout = setTimeout(() => {
        loadNotifications();
        isInitialMount.current = false;
      }, 0);
      
      // 2. Setup the polling interval
      const interval = setInterval(loadNotifications, 5000);

      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    } else {
      // For subsequent dependency changes (like user.id change)
      const interval = setInterval(loadNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [loadNotifications]);
    
  

  const handleNotifClick = (event) => setAnchorEl(event.currentTarget);
  const handleNotifClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  // Stats definition
  const stats = [
    {
      title: 'Account Status',
      value: user.status || 'ACTIVE',
      icon: <PersonIcon fontSize="medium" />,
      color: '#e3f2fd',
      iconColor: '#1976d2',
    },
    {
      title: 'Mobile Number',
      value: user.mobileNumber || 'Not Available',
      icon: <PhoneIcon fontSize="medium" />,
      color: '#e8f5e9',
      iconColor: '#2e7d32',
    },
    {
      title: 'Notifications',
      value: `${notifications.length} Unread`,
      icon: (
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon fontSize="medium" />
        </Badge>
      ),
      color: '#fff3e0',
      iconColor: '#ed6c02',
      onClick: handleNotifClick,
    },
    {
      title: 'Email',
      value: user.email || 'Not Available',
      icon: <EmailIcon fontSize="medium" />,
      color: '#f3e5f5',
      iconColor: '#9c27b0',
    },
  ];

  const actions = [
    { label: 'View Bills', icon: <BillIcon />, path: '/bills' },
    { label: 'Make Payment', icon: <PaymentIcon />, path: '/bills' },
    { label: 'Activate Service', icon: <ServiceIcon />, path: '/services' },
    { label: 'Contact Support', icon: <SupportIcon />, path: '/chat' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}><Sidebar /></Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            
            {/* Welcome Banner */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)', color: 'white', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, {user.username || 'User'}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Here is what is happening with your Sri-Tel account today.
              </Typography>
            </Paper>

            {/* Statistics Cards */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#444' }}>Account Overview</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((stat, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }} key={index}>
                  <Card 
                    elevation={1} 
                    onClick={stat.onClick}
                    sx={{ 
                      height: '100%', 
                      cursor: stat.onClick ? 'pointer' : 'default',
                      transition: 'transform 0.2s', 
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } 
                    }}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                      <Avatar variant="rounded" sx={{ bgcolor: stat.color, color: stat.iconColor, mr: 2, width: 48, height: 48 }}>
                        {stat.icon}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>{stat.title}</Typography>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>{stat.value}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Notification Popover */}
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              PaperProps={{ sx: { width: 320, maxHeight: 400, borderRadius: 2, mt: 1 } }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">Recent Notifications</Typography>
              </Box>
              <Divider />
              <List sx={{ p: 0 }}>
                {notifications.length === 0 ? (
                  <ListItem><ListItemText primary="No new notifications" sx={{ textAlign: 'center', color: 'gray' }} /></ListItem>
                ) : (
                  [...notifications].reverse().slice(0, 5).map((n) => (
                    <ListItem key={n.id} divider sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                      <ListItemText 
                        primary={n.subject} 
                        secondary={n.message} 
                        primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold' }}
                        secondaryTypographyProps={{ variant: 'caption', display: 'block' }}
                      />
                    </ListItem>
                  ))
                )}
              </List>
              <Button fullWidth onClick={() => navigate('/notifications')} sx={{ py: 1, textTransform: 'none' }}>
                View All Notifications
              </Button>
            </Popover>

            {/* Quick Actions */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#444' }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              {actions.map((action, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                  <Button fullWidth variant="outlined" startIcon={action.icon}
                    endIcon={<ArrowIcon fontSize="small" sx={{ ml: 'auto', opacity: 0.5 }} />}
                    onClick={() => navigate(action.path)}
                    sx={{ 
                      py: 2, px: 2, justifyContent: 'flex-start', color: '#555', 
                      borderColor: '#e0e0e0', backgroundColor: 'white', 
                      '&:hover': { borderColor: '#1976d2', backgroundColor: '#f5f9ff', color: '#1976d2' } 
                    }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {/* Information Section */}
            <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }} elevation={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SupportIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Need Help?</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" paragraph>
                Sri-Care is your one-stop portal. You can view your latest bills and manage services. 
                Our support is available 24/7.
              </Typography>
              <Button variant="text" onClick={() => navigate('/chat')} sx={{ p: 0 }}>Start a Chat &rarr;</Button>
            </Paper>

          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;