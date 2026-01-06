import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Card, Button, Chip, 
  CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Stack, Tooltip
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  Payment as PayIcon, 
  ReceiptLong as BillIcon,
  AddCircle as GenerateIcon,
  ArrowForwardIos as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import billingService from '../../services/billingService';

function BillList() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { 
    if (authLoading) {
      // Still loading auth, wait
      return;
    }
    
    if (user?.id) {
      console.log('Loading bills for user:', user.id);
      loadBills();
    } else {
      console.warn('No user found after auth loaded');
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const loadBills = async () => {
    if (!user?.id) {
      console.warn('Cannot load bills: User not found');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching bills...');
      const data = await billingService.getUserBills(user.id);
      console.log('Bills loaded:', data);
      setBills(data || []);
    } catch (error) {
      console.error('Error loading bills:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally { setLoading(false); }
  };

  const handleGenerateBill = async () => {
    if (!user?.id) {
      console.error('Cannot generate bill: User not found');
      return;
    }
    
    setGenerating(true);
    try {
      await billingService.generateBill(user.id);
      await loadBills(); 
    } catch (error) {
      console.error("Generation failed", error);
    } finally { setGenerating(false); }
  };

  const handleRowClick = (billId) => {
    navigate(`/bills/${billId}`);
  };

  const handlePayClick = (e, billId) => {
    e.stopPropagation(); // Prevents the row click from triggering
    navigate(`/payment/${billId}`);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      'PAID': { color: 'success', label: 'Paid' },
      'UNPAID': { color: 'error', label: 'Unpaid' },
      'PARTIALLY_PAID': { color: 'warning', label: 'Partial' }
    };
    const config = statusMap[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" variant="filled" />;
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
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight="bold">My Bills</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  View and manage your monthly statements.
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                startIcon={generating ? <CircularProgress size={20} color="inherit"/> : <GenerateIcon />}
                onClick={handleGenerateBill}
                disabled={generating}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'none',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
                }}
              >
                {generating ? 'Generating...' : 'Generate New Bill'}
              </Button>
            </Paper>

            {loading ? (
              <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
            ) : bills.length === 0 ? (
              <Card sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                <BillIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No bills found</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  You have no billing history yet. Generate a bill to get started.
                </Typography>
              </Card>
            ) : (
              <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>BILL #</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>DATE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>AMOUNT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>STATUS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow 
                        key={bill.id} 
                        hover 
                        onClick={() => handleRowClick(bill.id)}
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#f0f7ff' } // Light blue hover effect
                        }}
                      >
                        <TableCell sx={{ fontWeight: 'medium' }}>#{bill.billNumber}</TableCell>
                        <TableCell>{new Date(bill.billDate).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Rs. {bill.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusChip(bill.status)}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                            
                            {/* Pay Button (Only if Unpaid) */}
                            {(bill.status === 'UNPAID' || bill.status === 'PARTIALLY_PAID') ? (
                              <Button
                                variant="contained"
                                size="small"
                                color="error"
                                startIcon={<PayIcon />}
                                onClick={(e) => handlePayClick(e, bill.id)}
                                sx={{ borderRadius: 5, textTransform: 'none', px: 2, boxShadow: 0 }}
                              >
                                Pay
                              </Button>
                            ) : (
                                // Visual cue that row is clickable
                                <Tooltip title="View Details">
                                    <IconButton size="small" sx={{ color: 'text.disabled' }}>
                                        <ArrowIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default BillList;