/** @jsxRuntime classic */
/** @jsx React.createElement */

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import {
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  List,
  MenuItem,
  Paper,
  Popover,
  styled,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import React, { useState } from 'react';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const NotificationCenter = ({ 
  notifications = [], 
  unreadCount = 0,
  variant = 'staff'
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  const markAllAsRead = () => {
    // Implement mark all as read logic
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton 
        color="inherit"
        onClick={handleClick}
        aria-describedby={id}
        aria-label="notifications"
      >
        <StyledBadge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </StyledBadge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'auto',
            boxShadow: 6,
            borderRadius: 2
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button 
                size="small"
                onClick={markAllAsRead}
                startIcon={<CheckCircleIcon fontSize="small" />}
                sx={{ textTransform: 'none' }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
          
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            <Tab label="All" value="all" />
            <Tab label="Unread" value="unread" />
            <Tab label="Applications" value="application" />
            <Tab label="System" value="system" />
            <Tab label="Alerts" value="alerts" icon={<GppMaybeIcon />} />
            <Tab label="Whistleblower" value="whistleblower" icon={<SecurityIcon />} />
          </Tabs>
          
          <List dense>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <Paper 
                  key={notification.id}
                  elevation={0}
                  sx={{ 
                    mb: 1,
                    borderLeft: `4px solid ${
                      notification.status === 'urgent' ? '#f44336' :
                      notification.status === 'new' ? '#2196f3' :
                      '#4caf50'
                    }`,
                    '&:hover': {
                      boxShadow: 2
                    }
                  }}
                >
                  {notification.type === 'alerts' ? (
                    <Box sx={{ 
                      bgcolor: '#fff8e1',
                      borderLeft: '4px solid #ff6d00',
                      p: 1,
                      mb: 1
                    }}>
                      <Typography variant="subtitle2" color="error">
                        <GppMaybeIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                        Suspicious Activity Detected
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="error">
                          Investigate
                        </Button>
                        <Button size="small" variant="outlined">
                          Dismiss
                        </Button>
                      </Box>
                    </Box>
                  ) : notification.type === 'whistleblower' ? (
                    <Box sx={{ 
                      bgcolor: '#e8f5e9',
                      borderLeft: '4px solid #2e7d32',
                      p: 1,
                      mb: 1
                    }}>
                      <Typography variant="subtitle2" color="success.main">
                        <SecurityIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                        Whistleblower Report
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        New anonymous report received
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="success">
                          View Report
                        </Button>
                        <Button size="small" variant="outlined">
                          Archive
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <MenuItem 
                      onClick={() => handleNotificationAction(notification)}
                      sx={{ py: 1.5 }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          mb: 0.5
                        }}>
                          <Typography 
                            variant="subtitle2"
                            sx={{ 
                              fontWeight: notification.read ? 'normal' : 'bold',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Chip 
                            label={notification.status}
                            size="small"
                            sx={{ 
                              ml: 1,
                              backgroundColor: 
                                notification.status === 'urgent' ? '#f44336' :
                                notification.status === 'new' ? '#2196f3' : '#4caf50',
                              color: '#ffffff',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                        <Typography 
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(notification.time).toLocaleString()}
                        </Typography>
                      </Box>
                    </MenuItem>
                  )}
                </Paper>
              ))
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                py: 4,
                color: 'text.secondary'
              }}>
                <NotificationsIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2">
                  No {activeTab === 'all' ? '' : activeTab} notifications
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationCenter;