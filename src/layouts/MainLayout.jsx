/* eslint-disable no-unused-vars */
/** @jsxRuntime classic */
/** @jsx React.createElement */

import { AccountCircle, Menu, Notifications } from '@mui/icons-material';
import {
  AppBar,
  Badge,
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getFilteredRoutes } from '../component/navigationConfig';
import StaffNav from '../component/StaffNav';
import useAuth from '../hooks/useAuth';

const MainLayout = () => {
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications] = useState([]);
  
  const filteredRoutes = getFilteredRoutes(user?.permissions || []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#2E7D32',
          width: { md: `calc(100% - 240px)` },
          ml: { md: `240px` }
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
          )}
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Botswana Land Board Management System
          </Typography>
          
          <IconButton color="inherit">
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton color="inherit" edge="end">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <StaffNav 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        routes={filteredRoutes}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          ml: { md: `240px` },
          mt: '64px'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;