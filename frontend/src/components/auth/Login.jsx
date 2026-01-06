import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // ✅ Import useNavigate
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import MobileScreenShareIcon from '@mui/icons-material/MobileScreenShare';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import RssFeedIcon from '@mui/icons-material/RssFeed';

// ✅ Import your service
import { authService } from "../../services/api"; 

const LoginPage = () => {
  const navigate = useNavigate(); // ✅ Hook for redirection

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({ mobileNumber: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when typing
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ Use your authService logic
      const data = await authService.login(formData);
      
      if (data.success) {
        // Store tokens
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // ✅ Redirect to Dashboard
        console.log("Redirecting to dashboard...");
        navigate('/dashboard'); 
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      
      {/* --- LEFT SIDE: IMAGE SECTION --- */}
      <Box 
        sx={{ 
          flex: 1, 
          display: { xs: 'none', md: 'block' }, 
          backgroundColor: '#001e3c', 
          position: 'relative' 
        }}
      >
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072" 
          alt="Smart Connectivity"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Dark Overlay */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 30, 60, 0.85)', zIndex: 1 }} />

        {/* Logo Header */}
        <Box sx={{ position: 'absolute', top: '8%', left: '10%', zIndex: 2 }}>
          <Box sx={{ width: 60, height: 3, backgroundColor: '#2563eb', mb: 3 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.1)', p: 1, borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <RssFeedIcon sx={{ color: '#2563eb', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: 1 }}>
              SRI<span style={{ color: '#60a5fa' }}>CARE</span>
            </Typography>
          </Box>
        </Box>
        
        {/* Main Text */}
        <Box sx={{ position: 'absolute', top: '50%', left: '10%', right: '10%', color: 'white', transform: 'translateY(-50%)', zIndex: 2 }}>
          <Typography variant="h3" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Smart Connectivity.</Typography>
          <Typography variant="body1" sx={{ mt: 3, opacity: 0.9, lineHeight: 1.6 }}>
             The unified portal for Sri Tel customers. Experience blazing-fast payments, real-time data monitoring, and personalized VAS recommendations in one secure hub.
          </Typography>

          <Box sx={{ display: 'flex', gap: 6, mt: 6 }}>
             <Box>
                <Typography variant="h6" fontWeight="bold" color="#60a5fa">99.9%</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1 }}>NETWORK INTEGRITY</Typography>
             </Box>
             <Box>
                <Typography variant="h6" fontWeight="bold" color="#60a5fa">4.8/5</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1 }}>USER SATISFACTION</Typography>
             </Box>
             <Box>
                <Typography variant="h6" fontWeight="bold" color="#60a5fa">2M+</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1 }}>ACTIVE USERS</Typography>
             </Box>
          </Box>
        </Box>

        <Typography variant="caption" sx={{ position: 'absolute', bottom: 20, left: '10%', color: 'white', opacity: 0.5, zIndex: 2 }}>
            SECURED BY ENTERPRISE SHIELD © 2026 SRI TEL LTD
        </Typography>
      </Box>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4, backgroundColor: 'white' }}>
        <Box sx={{ maxWidth: 400, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#0b2b5c' }}>
             Welcome
          </Typography>
          
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            Please enter your account details to access the portal.
          </Typography>

          {/* Error Message Display */}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* ✅ Form Component wrapper to handle Submit */}
          <Box component="form" noValidate onSubmit={handleSubmit}>
            
            {/* Mobile Number Input */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Mobile Number</Typography>
            <TextField
              fullWidth
              name="mobileNumber" // ✅ Added name attribute for handleChange
              placeholder="0774810840"
              margin="normal"
              value={formData.mobileNumber}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MobileScreenShareIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {/* Password Input */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Password</Typography>
            <TextField
              fullWidth
              name="password" // ✅ Added name attribute for handleChange
              type={showPassword ? 'text' : 'password'}
              placeholder="......"
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />

            {/* Submit Button */}
            <Button 
              fullWidth 
              type="submit" // ✅ Ensures handleSubmit is called
              variant="contained" 
              size="large"
              disabled={loading}
              sx={{ 
                py: 1.5, 
                backgroundColor: '#2563eb', 
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to Portal →'}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                New to Sri-Care? 
                {/* ✅ Updated Link to use RouterLink for internal navigation */}
                <Link component={RouterLink} to="/register" underline="hover" sx={{ ml: 0.5 }}>
                  Create an account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

    </Box>
  );
};

export default LoginPage;