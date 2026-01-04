import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { notificationService } from '../services/api';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUserNotifications(user.id);

      let notifications = [];
      if (Array.isArray(response)) {
        notifications = response;
      } else if (response?.notifications) {
        notifications = response.notifications;
      } else if (response?.data && Array.isArray(response.data)) {
        notifications = response.data;
      }

      const count = notifications.filter(
        (n) => n?.read === false || n?.isRead === false || n?.status === 'UNREAD' || n?.status === 'unread'
      ).length;

      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const stats = [
    { title: 'Account Status', value: user.status, icon: <PersonIcon />, color: '#4caf50' },
    { title: 'Unread Notifications', value: unreadCount, icon: <NotificationsIcon />, color: '#ff9800' },
    { title: 'Mobile Number', value: user.mobileNumber, icon: <PhoneIcon />, color: '#2196f3' },
    { title: 'Email', value: user.email, icon: <EmailIcon />, color: '#9c27b0' },
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', backgroundColor: stat.color, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {stat.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary">
            View Bills
          </Button>
          <Button variant="contained" color="secondary">
            Make Payment
          </Button>
          <Button variant="contained" color="success">
            Activate Service
          </Button>
          <Button variant="outlined" color="primary">
            Contact Support
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Note: Full functionality will be available when Member 2's services are integrated.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome to Sri-Care
        </Typography>
        <Typography variant="body1" paragraph>
          Your one-stop portal for managing your telecommunications services.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • View and pay bills online<br />
          • Activate/deactivate services<br />
          • Receive real-time notifications<br />
          • Chat with customer support<br />
        </Typography>
      </Paper>
    </Container>
  );
};

export default Dashboard;