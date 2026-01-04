import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Chip, Alert, CardActions
} from '@mui/material';
import { 
  Public as RoamingIcon, 
  Wifi as DataIcon, 
  MusicNote as RingtoneIcon, 
  Phone as VoiceIcon, 
  Message as SmsIcon,
  Settings as DefaultIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import serviceService from '../../services/serviceService';

// 1. Define available services with metadata
const AVAILABLE_SERVICES = [
  { type: 'INTERNATIONAL_ROAMING', label: 'International Roaming', description: 'Stay connected globally.', icon: <RoamingIcon fontSize="large" /> },
  { type: 'DATA_PACKAGE', label: 'Data Package', description: 'High speed internet add-ons.', icon: <DataIcon fontSize="large" /> },
  { type: 'RING_TONE', label: 'Ring Tone', description: 'Custom tunes for callers.', icon: <RingtoneIcon fontSize="large" /> },
  { type: 'VOICE_PACKAGE', label: 'Voice Package', description: 'Extra talk time bundles.', icon: <VoiceIcon fontSize="large" /> },
  { type: 'SMS_PACKAGE', label: 'SMS Package', description: 'Bulk messaging bundles.', icon: <SmsIcon fontSize="large" /> },
  { type: 'CALLER_TUNE', label: 'Caller Tune', description: 'Set songs as caller tunes.', icon: <RingtoneIcon fontSize="large" /> },
];

function ServiceManagement() {
  const { user } = useAuth();
  const [userServices, setUserServices] = useState([]); // Services the user actually HAS
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for the service being activated
  const [selectedService, setSelectedService] = useState({
    serviceType: '',
    serviceName: '',
    serviceCode: '',
  });

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      const data = await serviceService.getUserServices(user.userId);
      setUserServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActivate = (serviceType) => {
    // Pre-fill the type, user just enters name/code
    setSelectedService({
      serviceType: serviceType,
      serviceName: '',
      serviceCode: ''
    });
    setOpenDialog(true);
  };

  const handleActivate = async () => {
    setError('');
    setSuccess('');
    try {
      await serviceService.activateService({
        userId: user.userId,
        mobileNumber: user.mobileNumber,
        ...selectedService,
      });
      setSuccess('Service activated successfully!');
      setOpenDialog(false);
      loadServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate service');
    }
  };

  const handleDeactivate = async (serviceId) => {
    if(!window.confirm("Are you sure you want to deactivate this service?")) return;

    setError('');
    setSuccess('');
    setActionLoading(serviceId);
    try {
      await serviceService.deactivateService(serviceId);
      setSuccess('Service deactivated successfully!');
      await loadServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate service');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Sidebar />
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Typography variant="h4" gutterBottom>
              Service Management
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {AVAILABLE_SERVICES.map((serviceTemplate) => {
                  // Check if user already has this service active
                  const activeInstance = userServices.find(
                    us => us.serviceType === serviceTemplate.type && us.status === 'ACTIVE'
                  );

                  return (
                    <Grid item xs={12} sm={6} md={4} key={serviceTemplate.type}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          border: activeInstance ? '2px solid #4caf50' : '1px solid #e0e0e0',
                          backgroundColor: activeInstance ? '#f9fff9' : '#fff'
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                          <Box sx={{ color: activeInstance ? 'primary.main' : 'text.secondary', mb: 2 }}>
                            {serviceTemplate.icon}
                          </Box>
                          <Typography variant="h6" component="div">
                            {serviceTemplate.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {serviceTemplate.description}
                          </Typography>

                          {activeInstance ? (
                            <Box>
                              <Chip label="Active" color="success" size="small" sx={{ mb: 1 }} />
                              <Typography variant="caption" display="block">
                                {activeInstance.serviceName}
                              </Typography>
                            </Box>
                          ) : (
                            <Chip label="Not Active" variant="outlined" size="small" />
                          )}
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                          {activeInstance ? (
                            <Button 
                              variant="outlined" 
                              color="error"
                              size="small"
                              disabled={actionLoading === activeInstance.id}
                              onClick={() => handleDeactivate(activeInstance.id)}
                            >
                              {actionLoading === activeInstance.id ? 'Processing...' : 'Deactivate'}
                            </Button>
                          ) : (
                            <Button 
                              variant="contained" 
                              color="primary"
                              size="small"
                              onClick={() => handleOpenActivate(serviceTemplate.type)}
                            >
                              Activate Now
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {/* Dialog for details when Activating */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
              <DialogTitle>Activate {AVAILABLE_SERVICES.find(s => s.type === selectedService.serviceType)?.label}</DialogTitle>
              <DialogContent>
                <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
                  Please provide details to activate this service.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Package Name / Alias"
                  value={selectedService.serviceName}
                  onChange={(e) => setSelectedService({ ...selectedService, serviceName: e.target.value })}
                  margin="dense"
                  required
                  placeholder="e.g. My Roaming"
                />
                
                <TextField
                  fullWidth
                  label="Activation Code"
                  value={selectedService.serviceCode}
                  onChange={(e) => setSelectedService({ ...selectedService, serviceCode: e.target.value })}
                  margin="dense"
                  required
                  helperText="e.g., *123# or Promo Code"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={handleActivate} variant="contained" disabled={!selectedService.serviceName || !selectedService.serviceCode}>
                  Confirm Activation
                </Button>
              </DialogActions>
            </Dialog>

          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ServiceManagement;