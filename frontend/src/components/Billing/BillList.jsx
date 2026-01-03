import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Card, CardContent, Button,
  Chip, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import billingService from '../../services/billingService';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentIcon from '@mui/icons-material/Payment';

function BillList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const data = await billingService.getUserBills(user.userId);
      setBills(data);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'UNPAID':
        return 'warning';
      case 'OVERDUE':
        return 'error';
      case 'PARTIALLY_PAID':
        return 'info';
      default:
        return 'default';
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
              My Bills
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : bills.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography>No bills found.</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => billingService.generateBill(user.userId).then(loadBills)}
                  >
                    Generate Sample Bill
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill Number</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell>Bill Date</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>{bill.billNumber}</TableCell>
                        <TableCell>{bill.billingPeriod}</TableCell>
                        <TableCell>{new Date(bill.billDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell align="right">Rs. {bill.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={bill.status} 
                            color={getStatusColor(bill.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/bills/${bill.id}`)}
                            sx={{ mr: 1 }}
                          >
                            View
                          </Button>
                          {(bill.status === 'UNPAID' || bill.status === 'OVERDUE') && (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<PaymentIcon />}
                              onClick={() => navigate(`/payment/${bill.id}`)}
                            >
                              Pay
                            </Button>
                          )}
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