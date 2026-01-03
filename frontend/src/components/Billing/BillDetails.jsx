import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Card, CardContent, Button,
  CircularProgress, Divider, Table, TableBody, TableCell, TableRow, Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import billingService from '../../services/billingService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';

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
    <Box>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Sidebar />
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/bills')}
              sx={{ mb: 2 }}
            >
              Back to Bills
            </Button>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4">Bill Details</Typography>
                  <Chip label={bill.status} color={bill.status === 'PAID' ? 'success' : 'warning'} />
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Bill Number</Typography>
                    <Typography variant="h6">{bill.billNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Billing Period</Typography>
                    <Typography variant="h6">{bill.billingPeriod}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Bill Date</Typography>
                    <Typography variant="h6">{new Date(bill.billDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                    <Typography variant="h6">{new Date(bill.dueDate).toLocaleDateString()}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>Bill Items</Typography>
                <Table>
                  <TableBody>
                    {bill.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.chargeType}</TableCell>
                        <TableCell align="right">Qty: {item.quantity}</TableCell>
                        <TableCell align="right">Rs. {item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6">Rs. {bill.totalAmount.toFixed(2)}</Typography>
                      </TableCell>
                    </TableRow>
                    {bill.paidAmount > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography>Paid:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography>Rs. {bill.paidAmount.toFixed(2)}</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {bill.paidAmount > 0 && bill.paidAmount < bill.totalAmount && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="h6">Balance:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6">
                            Rs. {(bill.totalAmount - bill.paidAmount).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {(bill.status === 'UNPAID' || bill.status === 'OVERDUE' || bill.status === 'PARTIALLY_PAID') && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PaymentIcon />}
                      onClick={() => navigate(`/payment/${bill.id}`)}
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