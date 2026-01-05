import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Card, CardContent, Button,
  CircularProgress, Divider, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import billingService from '../../services/billingService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import DescriptionIcon from '@mui/icons-material/Description';

function BillDetails() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillDetails();
  }, [billId]);

  const loadBillDetails = async () => {
    try {
      const data = await billingService.getBillById(billId);
      setBill(data);
    } catch (error) {
      console.error('Error loading bill details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const colorMap = {
      'PAID': 'success',
      'UNPAID': 'error',
      'PARTIALLY_PAID': 'warning'
    };
    return <Chip label={status} color={colorMap[status] || 'default'} fontWeight="bold" />;
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Box>
    );
  }

  if (!bill) {
    return (
      <Box>
        <Header />
        <Container sx={{ mt: 4 }}>
          <Typography>Bill not found</Typography>
        </Container>
      </Box>
    );
  }

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
            
            {/* Header / Nav */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Button 
                  startIcon={<ArrowBackIcon />} 
                  onClick={() => navigate('/bills')}
                  sx={{ color: 'text.secondary', fontWeight: 'bold' }}
                >
                  Back to Bills
                </Button>
            </Stack>

            <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {/* Blue Header Strip */}
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(to right, #1565c0, #42a5f5)', 
                color: 'white',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <DescriptionIcon fontSize="large" sx={{ opacity: 0.8 }} />
                    <Box>
                        <Typography variant="h5" fontWeight="bold">Invoice Details</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>#{bill.billNumber}</Typography>
                    </Box>
                </Box>
                {getStatusChip(bill.status)}
              </Box>

              <CardContent sx={{ p: 4 }}>
                {/* Bill Metadata Grid */}
                <Grid container spacing={4} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">BILLING PERIOD</Typography>
                    <Typography variant="subtitle1" fontWeight="medium">{bill.billingPeriod}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">BILL DATE</Typography>
                    <Typography variant="subtitle1" fontWeight="medium">{new Date(bill.billDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">DUE DATE</Typography>
                    <Typography variant="subtitle1" fontWeight="medium" color="error.main">{new Date(bill.dueDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">MOBILE NUMBER</Typography>
                    <Typography variant="subtitle1" fontWeight="medium">{bill.mobileNumber}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 4 }} />

                {/* Items Table */}
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>Breakdown</Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount (Rs.)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bill.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>
                            <Chip label={item.chargeType} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Summary Rows */}
                      <TableRow sx={{ bgcolor: '#fafafa' }}>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                          Rs. {bill.totalAmount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      
                      {bill.paidAmount > 0 && (
                        <TableRow sx={{ bgcolor: '#f0fdf4' }}>
                          <TableCell colSpan={3} align="right" sx={{ color: 'success.main', fontWeight: 'medium' }}>Paid Amount</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            - Rs. {bill.paidAmount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )}

                      {(bill.status === 'UNPAID' || bill.status === 'PARTIALLY_PAID') && (
                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.1rem' }}>
                            Balance Due
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.2rem' }}>
                            Rs. {(bill.totalAmount - bill.paidAmount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Footer Actions */}
                {(bill.status === 'UNPAID' || bill.status === 'OVERDUE' || bill.status === 'PARTIALLY_PAID') && (
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PaymentIcon />}
                      onClick={() => navigate(`/payment/${bill.id}`)}
                      sx={{ 
                        borderRadius: 2, 
                        px: 4, 
                        py: 1.5,
                        background: 'linear-gradient(to right, #d32f2f, #ef5350)',
                        boxShadow: 2
                      }}
                    >
                      Pay Now
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default BillDetails;