import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Card, CardContent, Button,
  CircularProgress, Chip, Alert, CardActions, Snackbar
} from '@mui/material';
import { 
  Public as RoamingIcon, 
  Wifi as DataIcon, 
  MusicNote as RingtoneIcon, 
  Phone as VoiceIcon, 
  Message as SmsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import serviceService from '../../services/serviceService';

// Define available services with metadata
const AVAILABLE_SERVICES = [
  { 
    type: 'INTERNATIONAL_ROAMING', 
    label: 'International Roaming', 
    description: 'Stay connected while traveling abroad with our global roaming service.', 
    icon: <RoamingIcon fontSize="large" />,
    color: '#1976d2'
  },
  { 
    type: 'DATA_PACKAGE', 
    label: 'Data Package', 
    description: 'High-speed internet add-ons for seamless browsing and streaming.', 
    icon: <DataIcon fontSize="large" />,
    color: '#2e7d32'
  },
  { 
    type: 'RING_TONE', 
    label: 'Ring Tone', 
    description: 'Personalize your phone with custom ringtones.', 
    icon: <RingtoneIcon fontSize="large" />,
    color: '#ed6c02'
  },
  { 
    type: 'VOICE_PACKAGE', 
    label: 'Voice Package', 
    description: 'Extra talk time bundles for unlimited conversations.', 
    icon: <VoiceIcon fontSize="large" />,
    color: '#9c27b0'
  },
  { 
    type: 'SMS_PACKAGE', 
    label: 'SMS Package', 
    description: 'Bulk messaging bundles for staying in touch.', 
    icon: <SmsIcon fontSize="large" />,
    color: '#d32f2f'
  },
  { 
    type: 'CALLER_TUNE', 
    label: 'Caller Tune', 
    description: 'Set custom songs as caller tunes for your callers to enjoy.', 
    icon: <RingtoneIcon fontSize="large" />,
    color: '#0288d1'
  },
];

function ServiceManagement() {
  const { user } = useAuth();
  const [userServices, setUserServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load user services on component mount
  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getUserServices(user.id);
      setUserServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
      showSnackbar('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleActivate = async (serviceType, serviceName) => {
    const confirmActivate = window.confirm(
      `Are you sure you want to activate ${serviceName}?`
    );
    
    if (!confirmActivate) return;

    setActionLoading(serviceType);
    try {
      await serviceService.activateService({
        userId: user.id,
        mobileNumber: user.mobileNumber,
        serviceType: serviceType,
        serviceName: serviceName,
        serviceCode: `CODE_${serviceType}_${Date.now()}` // Auto-generated code
      });
      
      showSnackbar(`${serviceName} activated successfully!`, 'success');
      await loadServices(); // Refresh the services list
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to activate ${serviceName}`;
      showSnackbar(errorMessage, 'error');
      console.error('Activation error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (serviceId, serviceName) => {
    const confirmDeactivate = window.confirm(
      `Are you sure you want to deactivate ${serviceName}?`
    );
    
    if (!confirmDeactivate) return;

    setActionLoading(serviceId);
    try {
      await serviceService.deactivateService(serviceId);
      showSnackbar(`${serviceName} deactivated successfully!`, 'success');
      await loadServices(); // Refresh the services list
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to deactivate ${serviceName}`;
      showSnackbar(errorMessage, 'error');
      console.error('Deactivation error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Header />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Sidebar />
          </Grid>
          
          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom fontWeight="600" color="primary.main">
                Service Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Activate or deactivate your telecommunication services with a single click.
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {AVAILABLE_SERVICES.map((serviceTemplate) => {
                  // Check if user already has this service active
                  const activeInstance = userServices.find(
                    us => us.serviceType === serviceTemplate.type && us.status === 'ACTIVE'
                  );

                  const isProcessing = actionLoading === serviceTemplate.type || 
                                      (activeInstance && actionLoading === activeInstance.id);

                  return (
                    <Grid item xs={12} sm={6} md={4} key={serviceTemplate.type}>
                      <Card 
                        elevation={activeInstance ? 4 : 2}
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          border: activeInstance ? `3px solid ${serviceTemplate.color}` : '1px solid #e0e0e0',
                          backgroundColor: activeInstance ? '#fafafa' : '#fff',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
                          {/* Icon */}
                          <Box 
                            sx={{ 
                              color: activeInstance ? serviceTemplate.color : 'text.secondary',
                              mb: 2,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            {serviceTemplate.icon}
                          </Box>

                          {/* Service Name */}
                          <Typography variant="h6" component="div" fontWeight="600" gutterBottom>
                            {serviceTemplate.label}
                          </Typography>

                          {/* Description */}
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '48px' }}>
                            {serviceTemplate.description}
                          </Typography>

                          {/* Status Chip */}
                          {activeInstance ? (
                            <Box sx={{ mt: 2 }}>
                              <Chip 
                                label="Active" 
                                sx={{ 
                                  backgroundColor: serviceTemplate.color,
                                  color: '#fff',
                                  fontWeight: '600',
                                  mb: 1
                                }} 
                                size="small" 
                              />
                              {activeInstance.serviceName && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {activeInstance.serviceName}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Chip 
                              label="Inactive" 
                              variant="outlined" 
                              size="small"
                              sx={{ mt: 2 }}
                            />
                          )}
                        </CardContent>
                        
                        {/* Action Button */}
                        <CardActions sx={{ justifyContent: 'center', pb: 3, pt: 0 }}>
                          {activeInstance ? (
                            <Button 
                              variant="outlined" 
                              color="error"
                              size="medium"
                              fullWidth
                              sx={{ mx: 2, fontWeight: '600' }}
                              disabled={isProcessing}
                              onClick={() => handleDeactivate(activeInstance.id, serviceTemplate.label)}
                            >
                              {isProcessing ? (
                                <>
                                  <CircularProgress size={20} sx={{ mr: 1 }} />
                                  Deactivating...
                                </>
                              ) : (
                                'Deactivate'
                              )}
                            </Button>
                          ) : (
                            <Button 
                              variant="contained" 
                              size="medium"
                              fullWidth
                              sx={{ 
                                mx: 2, 
                                fontWeight: '600',
                                backgroundColor: serviceTemplate.color,
                                '&:hover': {
                                  backgroundColor: serviceTemplate.color,
                                  filter: 'brightness(0.9)'
                                }
                              }}
                              disabled={isProcessing}
                              onClick={() => handleActivate(serviceTemplate.type, serviceTemplate.label)}
                            >
                              {isProcessing ? (
                                <>
                                  <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                                  Activating...
                                </>
                              ) : (
                                'Activate Now'
                              )}
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ServiceManagement;