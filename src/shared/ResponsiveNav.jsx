/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Add these imports at the top
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';

const StyledDrawer = styled(Drawer)(({ theme, variant }) => ({
  width: variant === 'citizen' ? 240 : 280,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: variant === 'citizen' ? 240 : 280,
    boxSizing: 'border-box',
    backgroundColor: variant === 'citizen' ? '#f5f7fa' : theme.palette.primary.dark,
    color: variant === 'citizen' ? theme.palette.text.primary : '#ffffff',
    borderRight: 'none'
  },
}));

const ResponsiveNav = ({ open, onClose, config, variant, _user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openSubMenus, setOpenSubMenus] = useState({});

  const handleSubMenuToggle = (id) => {
    setOpenSubMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigation = (path) => {
    if (path) navigate(path);
    if (isMobile) onClose();
  };

  const processedConfig = useMemo(() => {
    const subMenuState = {};
    config.forEach(route => {
      if (route?.subRoutes) {
        subMenuState[route.id] = route.subRoutes.some(
          subRoute => location.pathname === subRoute?.path
        );
      }
    });
    setOpenSubMenus(subMenuState);
    return config;
  }, [config, location.pathname]);

  return (
    <StyledDrawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
    >
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        px: 2,
        backgroundColor: variant === 'citizen' ? 'transparent' : theme.palette.primary.dark,
        minHeight: '64px !important'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              mr: 1,
              bgcolor: variant === 'citizen' ? theme.palette.primary.main : '#ffffff',
              color: variant === 'citizen' ? '#ffffff' : theme.palette.primary.main
            }}
          >
            {variant === 'citizen' ? 'C' : 'S'}
          </Avatar>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {variant === 'citizen' ? 'Citizen Portal' : 'BLBMS'}
          </Typography>
        </Box>
      </Toolbar>
      
      <Divider sx={{ borderColor: variant === 'citizen' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)' }} />
      
      {variant === 'staff' && (
        <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <Typography variant="subtitle2">
            MAIN NAVIGATION
          </Typography>
        </Box>
      )}
      
      <List sx={{ p: 1 }}>
        {processedConfig.map((route) => {
          const isSelected = route.path 
            ? location.pathname === route.path
            : route.subRoutes?.some(sub => location.pathname === sub?.path);
          
          return (
            <React.Fragment key={route.id || route.path}>
              {route.subRoutes ? (
                <>
                  <ListItem 
                    disablePadding
                    onClick={() => handleSubMenuToggle(route.id)}
                    selected={isSelected || openSubMenus[route.id]}
                  >
                    <ListItemButton
                      sx={{
                        borderRadius: 1,
                        margin: theme.spacing(0.5, 1),
                        padding: theme.spacing(1, 1.5),
                        '&.Mui-selected': {
                          backgroundColor: variant === 'citizen' 
                            ? theme.palette.action.selected 
                            : 'rgba(255,255,255,0.1)',
                        },
                        '&:hover': {
                          backgroundColor: variant === 'citizen' 
                            ? theme.palette.action.hover 
                            : 'rgba(255,255,255,0.08)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: 36,
                        color: isSelected 
                          ? theme.palette.primary.main 
                          : variant === 'citizen' 
                            ? theme.palette.text.primary 
                            : '#ffffff'
                      }}>
                        {route.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={route.name} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          color: variant === 'citizen' 
                            ? isSelected 
                              ? theme.palette.primary.main 
                              : theme.palette.text.primary
                            : '#ffffff'
                        }}
                      />
                      <ChevronRightIcon sx={{ 
                        transform: openSubMenus[route.id] ? 'rotate(90deg)' : 'none',
                        color: variant === 'citizen' 
                          ? theme.palette.text.secondary 
                          : 'rgba(255,255,255,0.7)'
                      }} />
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={openSubMenus[route.id]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {route.subRoutes.map((subRoute) => (
                        <ListItem
                          key={subRoute.id}
                          disablePadding
                          selected={location.pathname === subRoute.path}
                          onClick={() => handleNavigation(subRoute.path)}
                        >
                          <ListItemButton
                            sx={{
                              borderRadius: 1,
                              marginLeft: theme.spacing(3),
                              padding: theme.spacing(0.75, 1.5),
                              '&.Mui-selected': {
                                backgroundColor: variant === 'citizen' 
                                  ? theme.palette.action.selected 
                                  : 'rgba(255,255,255,0.1)',
                              },
                              '&:hover': {
                                backgroundColor: variant === 'citizen' 
                                  ? theme.palette.action.hover 
                                  : 'rgba(255,255,255,0.08)',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ 
                              minWidth: 36,
                              color: location.pathname === subRoute.path
                                ? theme.palette.primary.main
                                : variant === 'citizen'
                                  ? theme.palette.text.primary
                                  : '#ffffff'
                            }}>
                              {subRoute.icon || route.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subRoute.name} 
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                fontWeight: location.pathname === subRoute.path ? 'bold' : 'normal',
                                color: variant === 'citizen' 
                                  ? location.pathname === subRoute.path
                                    ? theme.palette.primary.main
                                    : theme.palette.text.primary
                                  : '#ffffff'
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem
                  disablePadding
                  selected={location.pathname === route.path}
                  onClick={() => handleNavigation(route.path)}
                >
                  <ListItemButton
                    sx={{
                      borderRadius: 1,
                      margin: theme.spacing(0.5, 1),
                      padding: theme.spacing(1, 1.5),
                      '&.Mui-selected': {
                        backgroundColor: variant === 'citizen' 
                          ? theme.palette.action.selected 
                          : 'rgba(255,255,255,0.1)',
                      },
                      '&:hover': {
                        backgroundColor: variant === 'citizen' 
                          ? theme.palette.action.hover 
                          : 'rgba(255,255,255,0.08)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 36,
                      color: location.pathname === route.path
                        ? theme.palette.primary.main
                        : variant === 'citizen'
                          ? theme.palette.text.primary
                          : '#ffffff'
                    }}>
                      {route.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={route.name} 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        fontWeight: location.pathname === route.path ? 'bold' : 'normal',
                        color: variant === 'citizen' 
                          ? location.pathname === route.path
                            ? theme.palette.primary.main
                            : theme.palette.text.primary
                          : '#ffffff'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          );
        })}
      </List>
      
      {variant === 'staff' && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Botswana Land Board Management System v2.0
            </Typography>
          </Box>
        </>
      )}
    </StyledDrawer>
  );
};

export default ResponsiveNav;