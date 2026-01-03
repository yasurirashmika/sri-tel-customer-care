import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, ListItemButton, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Bills', icon: <ReceiptIcon />, path: '/bills' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/payments' },
    { text: 'Services', icon: <SettingsIcon />, path: '/services' },
    { text: 'Chat Support', icon: <ChatIcon />, path: '/chat' },
  ];

  return (
    <Paper elevation={3} sx={{ height: '100%', minHeight: 'calc(100vh - 64px)' }}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default Sidebar;