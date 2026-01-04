import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, ListItemButton, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
// import PaymentIcon from '@mui/icons-material/Payment'; // Removed as it's part of Bills now

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard' 
    },
    { 
      text: 'Bills & Payments', // Renamed to clarify functionality
      icon: <ReceiptIcon />, 
      path: '/bills' 
    },

    { 
      text: 'Services', 
      icon: <SettingsIcon />, 
      path: '/services' 
    },
    { 
      text: 'Chat Support', 
      icon: <ChatIcon />, 
      path: '/chat' 
    },
  ];

  return (
    <Paper elevation={3} sx={{ height: '100%', minHeight: 'calc(100vh - 64px)' }}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default Sidebar;