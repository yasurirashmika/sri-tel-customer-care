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
            {/* 👇 FIXED: Changed navigation to '/bills' (My Bills List) */}
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/bills')} 
              sx={{ mb: 2, color: 'text.secondary', fontWeight: 'bold' }}
            >
              Back to My Bills
            </Button>

            <Grid container spacing={3}>
              {/* Payment Form Column */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      Payment Information
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                      <FormControl sx={{ mb: 3 }}>
                        <FormLabel id="payment-method-label">Payment Method</FormLabel>
                        <RadioGroup
                          row
                          aria-labelledby="payment-method-label"
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

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            fullWidth
                            label="Expiry Date"
                            name="cardExpiry"
                            value={paymentData.cardExpiry}
                            onChange={handleChange}
                            required
                            placeholder="MM/YY"
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            fullWidth
                            label="CVV"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handleChange}
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
                        sx={{ mt: 4, height: 50, borderRadius: 2 }}
                        disabled={processing}
                      >
                        {processing ? <CircularProgress size={24} color="inherit" /> : `Pay Rs. ${amountToPay.toFixed(2)}`}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Payment Summary Column */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#fafafa' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Payment Summary
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography color="text.secondary">Bill Number:</Typography>
                        <Typography fontWeight="medium">{bill?.billNumber}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography color="text.secondary">Total Amount:</Typography>
                        <Typography fontWeight="medium">Rs. {bill?.totalAmount.toFixed(2)}</Typography>
                      </Box>
                      {bill?.paidAmount > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography color="success.main">Already Paid:</Typography>
                          <Typography color="success.main">- Rs. {bill?.paidAmount.toFixed(2)}</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px dashed #bdbdbd' }}>
                        <Typography variant="h6">Amount to Pay:</Typography>
                        <Typography variant="h6" color="primary">Rs. {amountToPay.toFixed(2)}</Typography>
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