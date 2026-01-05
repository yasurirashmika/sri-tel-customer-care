import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  Grid,
  useTheme,
  useMediaQuery,
  Fade,
  IconButton
} from '@mui/material';
import { 
  RssFeed as TelcoIcon, 
  LockOutlined as LockIcon,
  PhoneIphone as MobileIcon,
  ShieldOutlined as SecurityIcon,
  ArrowForward as ArrowIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { authService } from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({ mobileNumber: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(formData);
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f8fafc', overflow: 'hidden' }}>
      <Grid container sx={{ height: '100vh' }}>
        
        {/* LEFT SIDE: PREMIUM BRANDING (Hidden on Mobile) */}
        {!isMobile && (
          <Grid
            item
            md={7}
            sx={{
              position: 'relative',
              background: `linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 138, 0.8) 100%), 
                           url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              px: 12,
              color: 'white',
            }}
          >
            {/* Background Accent Graphics */}
            <Box sx={{ position: 'absolute', top: '15%', left: '10%', width: 200, height: 2, bgcolor: '#60a5fa', opacity: 0.5 }} />
            
            <Fade in={true} timeout={1200}>
              <Box sx={{ zIndex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    background: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px', 
                    mr: 2,
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <TelcoIcon sx={{ fontSize: 32, color: '#60a5fa' }} />
                  </Box>
                  <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-1px' }}>
                    SRI<span style={{ color: '#60a5fa' }}>CARE</span>
                  </Typography>
                </Box>
                
                <Typography variant="h1" fontWeight="900" sx={{ mb: 3, fontSize: '4.5rem', lineHeight: 1, letterSpacing: '-3px' }}>
                  Smart <br />
                  <span style={{ color: '#60a5fa' }}>Connectivity.</span>
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 6, fontWeight: 300, maxWidth: 550, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                  The unified portal for Sri Tel customers. Experience 
                  blazing-fast payments, real-time data monitoring, and 
                  personalized VAS recommendations in one secure hub.
                </Typography>

                <Grid container spacing={4}>
                  {[
                    { label: 'Network Integrity', val: '99.9%' },
                    { label: 'User Satisfaction', val: '4.8/5' },
                    { label: 'Active Users', val: '2M+' }
                  ].map((stat, i) => (
                    <Grid item key={i}>
                      <Typography variant="h5" fontWeight="800" color="#60a5fa">{stat.val}</Typography>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.6 }}>
                        {stat.label}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Fade>
            
            <Box sx={{ position: 'absolute', bottom: 40, left: 100 }}>
              <Typography variant="caption" sx={{ opacity: 0.4, letterSpacing: 1 }}>
                SECURED BY ENTERPRISE SHIELD &copy; {new Date().getFullYear()} SRI TEL LTD
              </Typography>
            </Box>
          </Grid>
        )}

        {/* RIGHT SIDE: LOGIN FORM */}
        <Grid 
          item 
          xs={12} 
          md={5} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            bgcolor: '#ffffff',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.05)',
            zIndex: 10
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 450, px: { xs: 4, md: 10 }, mx: 'auto' }}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h3" fontWeight="900" color="#0f172a" sx={{ mb: 1.5, letterSpacing: '-1.5px' }}>
                Welcome 
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                Please enter your account details to access the portal.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" variant="filled" sx={{ mb: 4, borderRadius: '12px', bgcolor: '#ef4444' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1e293b' }}>Mobile Number</Typography>
                <TextField
                  fullWidth
                  required
                  id="mobileNumber"
                  name="mobileNumber"
                  placeholder="e.g. 0771234567"
                  variant="outlined"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><MobileIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    sx: { borderRadius: '14px', bgcolor: '#f8fafc' }
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>Password</Typography>
                  
                </Box>
                <TextField
                  fullWidth
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  variant="outlined"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '14px', bgcolor: '#f8fafc' }
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 4, mb: 4, py: 2, borderRadius: '14px',
                  fontWeight: 800, fontSize: '1.1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)',
                  boxShadow: '0 12px 24px -6px rgba(59, 130, 246, 0.5)',
                  '&:hover': {
                    background: '#1e3a8a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 30px -8px rgba(59, 130, 246, 0.6)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {loading ? <CircularProgress size={26} color="inherit" /> : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Sign In to Portal <ArrowIcon fontSize="small" />
                  </Box>
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  New to Sri-Care?{' '}
                  <Link component={RouterLink} to="/register" sx={{ color: '#3b82f6', fontWeight: 800, textDecoration: 'none', borderBottom: '2px solid transparent', '&:hover': { borderBottom: '2px solid #3b82f6' } }}>
                    Create an account
                  </Link>
                </Typography>
              </Box>
            </Box>
            
            
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;