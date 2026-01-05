import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  Divider,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  RssFeed as TelcoIcon,
  PersonOutline as PersonIcon,
  EmailOutlined as EmailIcon,
  PhoneIphone as MobileIcon,
  LockOutlined as LockIcon,
  HomeOutlined as AddressIcon,
  AppRegistration as RegisterIcon,
  CheckCircleOutline
} from '@mui/icons-material';
import { authService } from "../../services/api";

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let msg = '';
    if (name === 'mobileNumber') {
      const re = /^07[0-9]{8}$/;
      if (!value) msg = 'Required';
      else if (!re.test(value)) msg = 'Format: 07XXXXXXXX';
    } else if (name === 'password') {
      if (!value) msg = 'Required';
      else if (value.length < 6) msg = 'Min 6 characters';
    } else if (name === 'confirmPassword') {
      if (value !== formData.password) msg = 'Passwords do not match';
    } else if (name === 'fullName' && !value) {
      msg = 'Full name is required';
    } else if (name === 'email') {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) msg = 'Email required';
      else if (!emailRe.test(value)) msg = 'Invalid email format';
    }
    setErrors(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.register(formData);
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top right, #1e3a8a, #0f172a)',
        padding: isMobile ? 2 : 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background elements */}
      <Box sx={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
      <Box sx={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '30%', height: '30%', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />

      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 6,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {/* Left Brand Section */}
            {!isMobile && (
              <Box
                sx={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                  p: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  color: 'white',
                  position: 'relative'
                }}
              >
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                  <TelcoIcon sx={{ fontSize: 40, mr: 2, color: '#60a5fa' }} />
                  <Typography variant="h4" fontWeight="800" letterSpacing={-1}>
                    SRI-CARE
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="700" sx={{ mb: 2, lineHeight: 1.2 }}>
                  Join the Future of Connectivity.
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8, mb: 4 }}>
                  Create your account today and experience seamless self-care management for all your telecom needs.
                </Typography>
                
                <Box sx={{ mt: 'auto' }}>
                  {[ 'Instant Billing', 'Secure Payments', '24/7 Support' ].map((text) => (
                    <Box key={text} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <CheckCircleOutline sx={{ fontSize: 20, mr: 1.5, color: '#60a5fa' }} />
                      <Typography variant="body2" fontWeight="500">{text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Right Form Section */}
            <Box sx={{ flex: 1.2, p: isMobile ? 3 : 6 }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="800" color="#1e293b" gutterBottom>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please fill in the details below to get started.
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      variant="filled"
                      value={formData.fullName}
                      onChange={handleChange}
                      error={Boolean(errors.fullName)}
                      helperText={errors.fullName}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment>,
                        disableUnderline: true,
                        sx: { borderRadius: 2, backgroundColor: '#f8fafc' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mobile"
                      name="mobileNumber"
                      placeholder="07XXXXXXXX"
                      variant="filled"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      error={Boolean(errors.mobileNumber)}
                      helperText={errors.mobileNumber}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><MobileIcon fontSize="small" /></InputAdornment>,
                        disableUnderline: true,
                        sx: { borderRadius: 2, backgroundColor: '#f8fafc' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      variant="filled"
                      value={formData.email}
                      onChange={handleChange}
                      error={Boolean(errors.email)}
                      helperText={errors.email}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment>,
                        disableUnderline: true,
                        sx: { borderRadius: 2, backgroundColor: '#f8fafc' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address (Optional)"
                      name="address"
                      variant="filled"
                      value={formData.address}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><AddressIcon fontSize="small" /></InputAdornment>,
                        disableUnderline: true,
                        sx: { borderRadius: 2, backgroundColor: '#f8fafc' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      variant="filled"
                      value={formData.password}
                      onChange={handleChange}
                      error={Boolean(errors.password)}
                      helperText={errors.password}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>,
                        disableUnderline: true,
                        sx: { borderRadius: 2, backgroundColor: '#f8fafc' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm"
                      name="confirmPassword"
                      type="password"
                      variant="filled"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={Boolean(errors.confirmPassword)}
                      helperText={errors.confirmPassword}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>,
                        disableUnderline: true,
                        sx: { borderRadius: 2, backgroundColor: '#f8fafc' }
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 4,
                    mb: 3,
                    py: 1.8,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #1d4ed8, #1e40af)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create My Account'}
                </Button>

                <Divider sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.disabled" sx={{ px: 1, letterSpacing: 1 }}>
                    OR
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link 
                      component={RouterLink} 
                      to="/login" 
                      sx={{ 
                        color: '#2563eb', 
                        fontWeight: 700, 
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Sign In here
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>
        
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', display: 'block', mt: 3 }}>
          &copy; {new Date().getFullYear()} Sri Tel Ltd. All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Register;