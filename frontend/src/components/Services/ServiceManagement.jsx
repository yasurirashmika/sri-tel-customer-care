import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import serviceService from '../../services/serviceService';
import AddIcon from '@mui/icons-material/Add';

function ServiceManagement() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [newService, setNewService] = useState({
    serviceType: 'INTERNATIONAL_ROAMING',
    serviceName: '',
    serviceCode: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await serviceService.getUserServices(user.userId);
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setError('');
    setSuccess('');
    try {
      await serviceService.activateService({
        userId: user.userId,
        mobileNumber: user.mobileNumber,
        ...newService,
      });
      setSuccess('Service activated successfully!');
      setOpenDialog(false);
      loadServices();
      setNewService({ serviceType: 'INTERNATIONAL_ROAMING', serviceName: '', serviceCode: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate service');
    }
  };

  const handleDeactivate = async (serviceId) => {
    try {
      await serviceService.deactivateService(serviceId);
      setSuccess('Service deactivated successfully!');
      loadServices();
    } catch (err) {
      setError('Failed to deactivate service');
    }
  };

  const serviceTypes = [
    { value: 'INTERNATIONAL_ROAMING', label: 'International Roaming' },
    { value: 'DATA_PACKAGE', label: 'Data Package' },
    { value: 'RING_TONE', label: 'Ring Tone' },
    { value: 'CALLER_TUNE', label: 'Caller Tune' },
    { value: 'SMS_PACKAGE', label: 'SMS Package' },
    { value: 'VOICE_PACKAGE', label: 'Voice Package' },
  ];

  return (
    <Box>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Sidebar />
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">My Services</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Activate Service
              </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : services.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography>No services activated yet.</Typography>
                </CardContent>
              </Card>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service Name</TableCell>
                      <TableCell>Service Type</TableCell>
                      <TableCell>Service Code</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Activated On</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.serviceName}</TableCell>
                        <TableCell>{service.serviceType}</TableCell>
                        <TableCell>{service.serviceCode}</TableCell>
                        <TableCell>
                          <Chip 
                            label={service.status} 
                            color={service.status === 'ACTIVE' ? 'success' : 'default'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {service.activatedAt ? new Date(service.activatedAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {service.status === 'ACTIVE' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeactivate(service.id)}
                            >
                              Deactivate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Activate Service Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Activate New Service</DialogTitle>
              <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    value={newService.serviceType}
                    label="Service Type"
                    onChange={(e) => setNewService({ ...newService, serviceType: e.target.value })}
                  >
                    {serviceTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Service Name"
                  value={newService.serviceName}
                  onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
                  margin="normal"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Service Code"
                  value={newService.serviceCode}
                  onChange={(e) => setNewService({ ...newService, serviceCode: e.target.value })}
                  margin="normal"
                  required
                  helperText="e.g., *123# or specific service code"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={handleActivate} variant="contained">
                  Activate
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