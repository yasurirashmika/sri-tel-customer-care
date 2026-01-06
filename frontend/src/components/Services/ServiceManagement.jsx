import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Card, CircularProgress, Switch, 
  FormControlLabel, Paper, Snackbar, Alert, Avatar
} from '@mui/material';
import { 
  Public, Wifi, MusicNote, Phone, Message, LibraryMusic 
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import serviceService from '../../services/serviceService';

// --- Configuration Data ---
const SERVICES_CONFIG = [
  { type: 'INTERNATIONAL_ROAMING', label: 'International Roaming', desc: 'Global roaming access.', icon: <Public />, color: '#1976d2', bg: '#e3f2fd' },
  { type: 'DATA_PACKAGE', label: 'Data Package', desc: 'High-speed internet add-ons.', icon: <Wifi />, color: '#2e7d32', bg: '#e8f5e9' },
  { type: 'RING_TONE', label: 'Ring Tone', desc: 'Custom ringtones.', icon: <MusicNote />, color: '#ed6c02', bg: '#fff3e0' },
  { type: 'VOICE_PACKAGE', label: 'Voice Package', desc: 'Extra talk time bundles.', icon: <Phone />, color: '#9c27b0', bg: '#f3e5f5' },
  { type: 'SMS_PACKAGE', label: 'SMS Package', desc: 'Bulk messaging bundles.', icon: <Message />, color: '#d32f2f', bg: '#ffebee' },
  { type: 'CALLER_TUNE', label: 'Caller Tune', desc: 'Songs for your callers.', icon: <LibraryMusic />, color: '#0288d1', bg: '#e1f5fe' },
];

// --- Sub-Component: Service Card (Fixed Layout) ---
const ServiceCard = ({ config, isActive, isProcessing, onToggle }) => (
  <Card 
    elevation={isActive ? 4 : 1}
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 3,
      border: isActive ? `2px solid ${config.color}` : '2px solid transparent',
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
    }}
  >
    {/* 1. Content Area (Grows to fill space) */}
    <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <Avatar 
        sx={{ 
          width: 56, height: 56, mb: 2, 
          bgcolor: isActive ? config.color : config.bg, 
          color: isActive ? '#fff' : config.color 
        }}
      >
        {config.icon}
      </Avatar>
      
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {config.label}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {config.desc}
      </Typography>
    </Box>

    {/* 2. Action Footer (Fixed at bottom) */}
    <Box 
      sx={{ 
        p: 2, 
        bgcolor: isActive ? `${config.color}15` : '#f5f5f5', // Light tint when active, gray when inactive
        display: 'flex', 
        justifyContent: 'center',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      {isProcessing ? (
        <CircularProgress size={24} sx={{ color: config.color }} />
      ) : (
        <FormControlLabel
          control={
            <Switch 
              checked={isActive} 
              onChange={onToggle}
              color="primary" // Uses theme primary color
            />
          }
          label={
            <Typography variant="body2" fontWeight="bold" sx={{ color: isActive ? config.color : 'text.secondary' }}>
              {isActive ? 'Active' : 'Activate'}
            </Typography>
          }
          sx={{ mr: 0 }} 
        />
      )}
    </Box>
  </Card>
);

// --- Main Component ---
function ServiceManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const [userServices, setUserServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [notification, setNotification] = useState({ open: false, msg: '', type: 'success' });

  useEffect(() => { 
    if (authLoading) {
      // Still loading auth, wait
      return;
    }
    
    if (user?.id) {
      console.log('Loading services for user:', user.id);
      loadServices();
    } else {
      console.warn('No user found after auth loaded');
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const loadServices = async () => {
    if (!user?.id) {
      console.warn('Cannot load services: User not found');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching services...');
      const data = await serviceService.getUserServices(user.id);
      console.log('Services loaded:', data);
      setUserServices(data || []);
    } catch (err) {
      console.error('Error loading services:', err);
      console.error('Error details:', err.response?.data || err.message);
      notify('Failed to load services', 'error');
    } finally { setLoading(false); }
  };

  const handleToggle = async (template) => {
    if (!user?.id) {
      notify('User not found. Please login again.', 'error');
      return;
    }
    
    const activeSvc = userServices.find(s => s.serviceType === template.type && s.status === 'ACTIVE');
    const isActive = !!activeSvc;
    setProcessingId(template.type);

    try {
      if (isActive) {
        await serviceService.deactivateService(activeSvc.id);
        notify(`${template.label} deactivated`);
      } else {
        await serviceService.activateService({
          userId: user.id,
          mobileNumber: user.mobileNumber,
          serviceType: template.type,
          serviceName: template.label,
          serviceCode: `CODE_${template.type}_${Date.now()}`
        });
        notify(`${template.label} activated`);
      }
      await loadServices();
    } catch (err) {
      notify(err.response?.data?.message || 'Operation failed', 'error');
    } finally { setProcessingId(null); }
  };

  const notify = (msg, type = 'success') => setNotification({ open: true, msg, type });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Sidebar />
          </Grid>
          
          <Grid size={{ xs: 12, md: 9 }}>
            {/* Page Title Banner */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, mb: 3, borderRadius: 2, 
                background: 'linear-gradient(to right, #1565c0, #42a5f5)', 
                color: '#fff' 
              }}
            >
              <Typography variant="h5" fontWeight="bold">Service Management</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Manage your telecommunication subscriptions.
              </Typography>
            </Paper>

            {loading ? (
              <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={3}>
                {SERVICES_CONFIG.map((config) => {
                  const isActive = userServices.some(s => s.serviceType === config.type && s.status === 'ACTIVE');
                  return (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={config.type}>
                      <ServiceCard 
                        config={config} 
                        isActive={isActive} 
                        isProcessing={processingId === config.type}
                        onToggle={() => handleToggle(config)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar open={notification.open} autoHideDuration={3000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification.type} variant="filled">{notification.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ServiceManagement;