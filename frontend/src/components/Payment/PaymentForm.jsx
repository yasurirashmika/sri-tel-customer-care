import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Card, CardContent, TextField,
  Button, Alert, CircularProgress, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import billingService from '../../services/billingService';
import paymentService from '../../services/paymentService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function PaymentForm() {
  const { billId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'CREDIT_CARD',
    cardNumber: '',
    cardExpiry: '',
    cvv: '',
    cardHolderName: '',
  });

  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    try {
      const data = await billingService.getBillById(billId);
      setBill(data);
    } catch (error) {
      setError('Failed to load bill details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProcessing(true);

    try {
      const payment = {
        userId: user.id,
        billId: bill.id,
        amount: bill.totalAmount - bill.paidAmount,
        ...paymentData,
      };

      await paymentService.processPayment(payment);
      setSuccess('Payment processed successfully!');
      setTimeout(() => navigate('/bills'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
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

  const amountToPay = bill ? bill.totalAmount - bill.paidAmount : 0;

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
              onClick={() => navigate(`/bills/${billId}`)}
              sx={{ mb: 2 }}
            >
              Back to Bill Details
            </Button>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Payment Information
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                      <FormControl sx={{ mb: 3 }}>
                        <FormLabel>Payment Method</FormLabel>
                        <RadioGroup
                          name="paymentMethod"
                          value={paymentData.paymentMethod}
                          onChange={handleChange}
                        >
                          <FormControlLabel value="CREDIT_CARD" control={<Radio />} label="Credit Card" />
                          <FormControlLabel value="DEBIT_CARD" control={<Radio />} label="Debit Card" />
                        </RadioGroup>
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Card Number"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handleChange}
                        margin="normal"
                        required
                        placeholder="1234 5678 9012 3456"
                      />

                      <TextField
                        fullWidth
                        label="Card Holder Name"
                        name="cardHolderName"
                        value={paymentData.cardHolderName}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Expiry Date"
                            name="cardExpiry"
                            value={paymentData.cardExpiry}
                            onChange={handleChange}
                            margin="normal"
                            required
                            placeholder="MM/YY"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="CVV"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handleChange}
                            margin="normal"
                            required
                            type="password"
                            placeholder="123"
                            inputProps={{ maxLength: 3 }}
                          />
                        </Grid>
                      </Grid>

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={processing}
                      >
                        {processing ? <CircularProgress size={24} /> : `Pay Rs. ${amountToPay.toFixed(2)}`}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payment Summary
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Bill Number:</Typography>
                        <Typography>{bill?.billNumber}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Amount:</Typography>
                        <Typography>Rs. {bill?.totalAmount.toFixed(2)}</Typography>
                      </Box>
                      {bill?.paidAmount > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Already Paid:</Typography>
                          <Typography>Rs. {bill?.paidAmount.toFixed(2)}</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1 }}>
                        <Typography variant="h6">Amount to Pay:</Typography>
                        <Typography variant="h6">Rs. {amountToPay.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default PaymentForm;