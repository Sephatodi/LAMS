/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    AccountCircle,
    Dashboard,
    ExitToApp,
    HelpOutline,
    Home,
    Menu as MenuIcon,
    Notifications,
    Settings
} from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CitizenNavbar = ({ user, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

  // Mock notifications data
  const notifications = [
    { id: 1, text: 'Your land application has been received', time: '2 hours ago', read: false },
    { id: 2, text: 'New educational resource available', time: '1 day ago', read: true },
    { id: 3, text: 'System maintenance scheduled', time: '3 days ago', read: true }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };

  const handleDashboardHome = () => {
    navigate('/citizen-dashboard');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleClose();
  };

  const handleHelp = () => {
    navigate('/help-center');
    handleClose();
  };

  return (
    <AppBar 
      position="sticky"
      elevation={1}
      sx={{ 
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        {/* Left Section - Logo & Main Nav */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {isMobile ? (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => {/* Implement mobile menu toggle */}}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={handleDashboardHome}
          >
            <Dashboard color="primary" sx={{ fontSize: 32, mr: 1 }} />
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Tribal Land Portal
            </Typography>
          </Box>

          {!isMobile && (
            <Button
              startIcon={<Home />}
              onClick={handleDashboardHome}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              Dashboard Home
            </Button>
          )}
        </Box>

        {/* Right Section - User Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="large"
            color="inherit"
            onClick={handleNotificationsOpen}
            sx={{ position: 'relative' }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 400,
                mt: 1.5,
                boxShadow: theme.shadows[10]
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 600 }}>
              Notifications
            </Typography>
            <Divider />
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  sx={{ 
                    py: 1.5,
                    borderLeft: notification.read ? 'none' : `3px solid ${theme.palette.primary.main}`
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2">{notification.text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            ) : (
              <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                No new notifications
              </Typography>
            )}
          </Menu>

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar 
                alt={user?.name || 'User'} 
                src={user?.avatar}
                sx={{ 
                  width: 36, 
                  height: 36,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>

            {!isMobile && (
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                {user?.name || 'User'}
              </Typography>
            )}

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  width: 240,
                  mt: 1.5,
                  boxShadow: theme.shadows[10]
                }
              }}
            >
              <MenuItem onClick={handleProfile}>
                <AccountCircle sx={{ mr: 1.5 }} />
                My Profile
              </MenuItem>
              <MenuItem onClick={handleSettings}>
                <Settings sx={{ mr: 1.5 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleHelp}>
                <HelpOutline sx={{ mr: 1.5 }} />
                Help Center
              </MenuItem>
              <Divider />
              <MenuItem onClick={onLogout}>
                <ExitToApp sx={{ mr: 1.5 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CitizenNavbar;