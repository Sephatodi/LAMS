/** @jsxRuntime classic */
/** @jsx React.createElement */

import { ChevronLeft, ExpandLess, ExpandMore } from '@mui/icons-material';
import {
    Badge,
    Box,
    CircularProgress,
    Collapse,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1, 1.5),
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledSubListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginLeft: theme.spacing(3),
  padding: theme.spacing(0.75, 1.5),
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StaffNav = ({ 
  mobileOpen = false, 
  handleDrawerToggle = () => {}, 
  routes = [], 
  userPermissions = [], 
  isLoading = false 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openSubMenu, setOpenSubMenu] = useState({});

  // Initialize submenu state based on current route
  useEffect(() => {
    if (!Array.isArray(routes)) return;
    
    const subMenuState = {};
    routes.forEach(route => {
      if (route?.subRoutes) {
        subMenuState[route.id] = route.subRoutes.some(
          subRoute => location.pathname === subRoute?.path
        );
      }
    });
    setOpenSubMenu(subMenuState);
  }, [location.pathname, routes]);

  const handleSubMenuToggle = (id) => {
    setOpenSubMenu(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigation = (path) => {
    if (isMobile && handleDrawerToggle) {
      handleDrawerToggle();
    }
    if (path) {
      navigate(path);
    }
  };

  const renderIcon = (route) => {
    if (!route) return null;
    if (route.badge) {
      return (
        <Badge color="error" variant="dot" overlap="circular">
          {route.icon}
        </Badge>
      );
    }
    return route.icon;
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        width: { md: drawerWidth },
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%',
        minHeight: '100vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!Array.isArray(routes) || routes.length === 0) {
    return (
      <Box sx={{ 
        width: { md: drawerWidth },
        p: 2,
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="body2" color="textSecondary">
          No navigation items available
        </Typography>
      </Box>
    );
  }

  const drawerContent = (
    <>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          BLBMS
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ p: 1 }}>
        {routes.map((route) => {
          if (!route) return null;
          
          const isSelected = route.path 
            ? location.pathname === route.path
            : route.subRoutes?.some(sub => location.pathname === sub?.path);
          
          return (
            <React.Fragment key={route.id || route.path}>
              {route.divider && <Divider sx={{ my: 1 }} />}
              
              {route.subRoutes ? (
                <>
                  <StyledListItem 
                    button 
                    onClick={() => handleSubMenuToggle(route.id)}
                    selected={isSelected || openSubMenu[route.id]}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {renderIcon(route)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={route.name} 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        fontWeight: isSelected ? 'bold' : 'normal'
                      }}
                    />
                    {openSubMenu[route.id] ? <ExpandLess /> : <ExpandMore />}
                  </StyledListItem>
                  <Collapse in={openSubMenu[route.id]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {Array.isArray(route.subRoutes) && route.subRoutes.map((subRoute) => (
                        subRoute && (
                          <StyledSubListItem
                            key={subRoute.id || subRoute.path}
                            button
                            component={Link}
                            to={subRoute.path || '#'}
                            selected={location.pathname === subRoute.path}
                            onClick={() => handleNavigation(subRoute.path)}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {subRoute.icon || renderIcon(subRoute)}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subRoute.name} 
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                fontWeight: location.pathname === subRoute.path ? 'bold' : 'normal'
                              }}
                            />
                          </StyledSubListItem>
                        )
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <StyledListItem
                  button
                  component={Link}
                  to={route.path || '#'}
                  selected={location.pathname === route.path}
                  onClick={() => handleNavigation(route.path)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {renderIcon(route)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={route.name} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      fontWeight: location.pathname === route.path ? 'bold' : 'normal'
                    }}
                  />
                </StyledListItem>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="Main navigation"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ 
          keepMounted: true,
          BackdropProps: { invisible: isMobile }
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default StaffNav;