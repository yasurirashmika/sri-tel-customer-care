import React from 'react';
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

const Dashboard = () => {
  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Dashboard statistics
  const stats = [
    {
      title: 'Account Status',
      value: user.status || 'ACTIVE',
      icon: <PersonIcon />,
      color: '#4caf50',
    },
    {
      title: 'Unread Notifications',
      value: 'N/A',
      icon: <NotificationsIcon />,
      color: '#ff9800',
    },
    {
      title: 'Mobile Number',
      value: user.mobileNumber || 'Not Available',
      icon: <PhoneIcon />,
      color: '#2196f3',
    },
    {
      title: 'Email',
      value: user.email || 'Not Available',
      icon: <EmailIcon />,
      color: '#9c27b0',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: stat.color,
                color: 'white',
              }}
            >
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

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 4 }}>
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
          Note: Some features will be enabled once all backend services are integrated.
        </Typography>
      </Paper>

      {/* Welcome Section */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Welcome to Sri-Care
        </Typography>

        <Typography variant="body1" paragraph>
          Sri-Care is your one-stop self-care portal for managing Sri Tel
          telecommunication services.
        </Typography>

        <Typography variant="body2" color="text.secondary">
          • View and pay bills online<br />
          • Activate or deactivate services<br />
          • Manage your account securely<br />
          • Receive alerts and notifications<br />
          • Contact customer support easily
        </Typography>
      </Paper>
    </Container>
  );
};

export default Dashboard;
