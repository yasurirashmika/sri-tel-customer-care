import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  PhoneAndroid as PhoneIcon,
  Email as EmailIcon,
  ReceiptLong as BillIcon,
  Payment as PaymentIcon,
  Settings as ServiceIcon,
  SupportAgent as SupportIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

// Import Layout Components
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Stats Data
  const stats = [
    {
      title: 'Account Status',
      value: user.status || 'ACTIVE',
      icon: <PersonIcon fontSize="medium" />,
      color: '#e3f2fd', // Light Blue bg
      iconColor: '#1976d2', // Primary Blue
    },
    {
      title: 'Mobile Number',
      value: user.mobileNumber || 'Not Available',
      icon: <PhoneIcon fontSize="medium" />,
      color: '#e8f5e9', // Light Green bg
      iconColor: '#2e7d32', // Green
    },
    {
      title: 'Notifications',
      value: '0 Unread', // Placeholder
      icon: <NotificationsIcon fontSize="medium" />,
      color: '#fff3e0', // Light Orange bg
      iconColor: '#ed6c02', // Orange
    },
    {
      title: 'Email',
      value: user.email || 'Not Available',
      icon: <EmailIcon fontSize="medium" />,
      color: '#f3e5f5', // Light Purple bg
      iconColor: '#9c27b0', // Purple
    },
  ];

  // Quick Actions Data
  const actions = [
    { label: 'View Bills', icon: <BillIcon />, path: '/bills', color: 'primary' },
    { label: 'Make Payment', icon: <PaymentIcon />, path: '/bills', color: 'secondary' }, 
    { label: 'Activate Service', icon: <ServiceIcon />, path: '/services', color: 'success' },
    { label: 'Contact Support', icon: <SupportIcon />, path: '/chat', color: 'info' }, 
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          
          {/* Sidebar: Full width on mobile, 3/12 on desktop */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Sidebar />
          </Grid>
          
          {/* Main Content: Full width on mobile, 9/12 on desktop */}
          <Grid size={{ xs: 12, md: 9 }}>
            
            {/* Welcome Banner */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                color: 'white',
                borderRadius: 2
              }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, {user.username || 'User'}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Here is what is happening with your Sri-Tel account today.
              </Typography>
            </Paper>

            {/* Statistics Cards */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#444' }}>
              Account Overview
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((stat, index) => (
                // UPDATED RESPONSIVE SIZING HERE
                // md: 6 means 2 cards per row on laptops
                // lg: 3 means 4 cards per row on large screens
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }} key={index}>
                  <Card 
                    elevation={1}
                    sx={{ 
                      height: '100%', 
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                    }}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                      <Avatar 
                        variant="rounded" 
                        sx={{ 
                          bgcolor: stat.color, 
                          color: stat.iconColor,
                          mr: 2,
                          width: 48,
                          height: 48
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}> {/* minWidth:0 fixes flex overflow issues */}
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {stat.title}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                          {stat.value}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Quick Actions Grid */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#444' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {actions.map((action, index) => (
                // UPDATED RESPONSIVE SIZING HERE
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={action.icon}
                    endIcon={<ArrowIcon fontSize="small" sx={{ ml: 'auto', opacity: 0.5 }} />}
                    onClick={() => navigate(action.path)}
                    sx={{
                      py: 2,
                      px: 2,
                      justifyContent: 'flex-start',
                      color: '#555',
                      borderColor: '#e0e0e0',
                      backgroundColor: 'white',
                      '&:hover': {
                        borderColor: '#1976d2',
                        backgroundColor: '#f5f9ff',
                        color: '#1976d2'
                      }
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
                <Typography variant="h6" fontWeight="bold">
                  Need Help?
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" paragraph>
                Sri-Care is your one-stop portal. You can view your latest bills, check your usage, 
                and manage your add-on services directly from here. If you face any connectivity issues, 
                our AI-powered Chat Support is available 24/7.
              </Typography>
              <Button 
                variant="text" 
                onClick={() => navigate('/chat')}
                sx={{ p: 0 }}
              >
                Start a Chat &rarr;
              </Button>
            </Paper>

          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;