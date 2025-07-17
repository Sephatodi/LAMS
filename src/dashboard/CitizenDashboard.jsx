 
/** @jsxRuntime classic */
/** @jsx React.createElement */
import {
  AccountCircle,
  Assignment as ApplicationIcon,
  Dashboard,
  Report as DisputeIcon,
  School as EducationIcon,
  ExitToApp,
  HelpOutline,
  Home as HomeIcon,
  Map as MapIcon,
  Notifications,
  Person as ProfileIcon,
  Description as RecordsIcon,
  Settings
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../shared/MainLayout';

// Lazy-loaded components
const LandingPage = React.lazy(() => import('../component/LandingPage'));
const ApplyForLand = React.lazy(() => import('../component/ApplyForLand'));
const ApplicationStatus = React.lazy(() => import('../component/ApplicationStatus'));
const LandRecords = React.lazy(() => import('../component/LandRecords'));
const ReportDispute = React.lazy(() => import('../component/DisputeFormStepper'));
const Profile = React.lazy(() => import('../component/Profile'));
const EducationPortal = React.lazy(() => import('../component/EducationPortal'));
const ViewLand = React.lazy(() => import('../component/ViewLand'));
const SolutionHighlights = React.lazy(() => import('../component/SolutionHighlights'));
const TransparencySection = React.lazy(() => import('../component/TransparencySection'));
const WaitlistStatus = React.lazy(() => import('../component/WaitlistStatus'));

const navConfig = [
  { 
    path: "/", 
    name: "Home",
    icon: <HomeIcon />,
    exact: true,
    solution: "Central portal for all land services"
  },
  { 
    path: "education-portal", 
    name: "Education Portal", 
    icon: <EducationIcon />,
    solution: "Land management education resources"
  },
  { 
    path: "view-land", 
    name: "View Land", 
    icon: <MapIcon />,
    solution: "Interactive land parcel visualization"
  },
  { 
    path: "apply-land", 
    name: "Apply for Land", 
    icon: <ApplicationIcon />,
    solution: "Digital land application submission"
  },
  { 
    path: "application-status", 
    name: "Application Status", 
    icon: <ApplicationIcon />,
    solution: "Real-time application tracking"
  },
  { 
    path: "land-records", 
    name: "Land Records", 
    icon: <RecordsIcon />,
    solution: "Blockchain-secured land records"
  },
  { 
    path: "report-dispute", 
    name: "Report Dispute", 
    icon: <DisputeIcon />,
    solution: "Digital dispute resolution system"
  },
  { 
    path: "profile", 
    name: "Profile", 
    icon: <ProfileIcon />,
    solution: "Secure personal data management"
  }
];

const CitizenDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State for dashboard data
  const [waitlistPosition, setWaitlistPosition] = useState(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
  const [transparencyLogs, setTransparencyLogs] = useState([]);
 const [_setNotifications, notifications] = useState([
    { id: 1, text: 'Your land application has been received', time: '2 hours ago', read: false },
    { id: 2, text: 'New educational resource available', time: '1 day ago', read: true },
    { id: 3, text: 'System maintenance scheduled', time: '3 days ago', read: true }
  ]);

  useEffect(() => {
    const initializeDashboardData = async () => {
      try {
        // Fetch waitlist data
        const waitlistResponse = await fetch('/api/waitlist/position');
        const waitlistData = await waitlistResponse.json();
        setWaitlistPosition(waitlistData.position);
        setEstimatedWaitTime(waitlistData.estimatedWait);

        // Fetch transparency logs
        const transparencyResponse = await fetch('/api/transparency/logs');
        const transparencyData = await transparencyResponse.json();
        setTransparencyLogs(transparencyData);
      } catch (error) {
        console.error("Dashboard initialization error:", error);
      }
    };
    
    initializeDashboardData();
  }, []);

  const dashboardCards = navConfig
    .filter(item => item.path !== "/")
    .map(item => ({
      path: item.path,
      icon: React.cloneElement(item.icon, { fontSize: "large" }),
      title: item.name,
      description: item.solution
    }));

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setDrawerOpen(open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout
      title="Citizen Land Services Portal"
      user={user}
      navConfig={navConfig}
      onLogout={logout}
      variant="citizen"
      additionalComponents={{
        appBar: (
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {isMobile && (
                  <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={toggleDrawer(true)}
                    sx={{ mr: 1 }}
                  >
                    <Dashboard />
                  </IconButton>
                )}
                
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
                  {waitlistPosition && (
                    <Chip 
                      label={`Waitlist: ${waitlistPosition}`}
                      color="info"
                      size="small"
                      sx={{ ml: 2, verticalAlign: 'middle' }}
                    />
                  )}
                </Box>

                {!isMobile && (
                  <Button
                    startIcon={<HomeIcon />}
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
                    <MenuItem onClick={() => handleNavigation('profile')}>
                      <AccountCircle sx={{ mr: 1.5 }} />
                      My Profile
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('settings')}>
                      <Settings sx={{ mr: 1.5 }} />
                      Settings
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('help-center')}>
                      <HelpOutline sx={{ mr: 1.5 }} />
                      Help Center
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={logout}>
                      <ExitToApp sx={{ mr: 1.5 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>
            </Toolbar>
          </AppBar>
        ),
        mobileDrawer: (
          <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
            <Box sx={{ width: 250 }} role="presentation">
              <List>
                {navConfig.map((item) => (
                  <ListItem 
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      '&:hover': { backgroundColor: theme.palette.action.hover },
                      py: 1.5
                    }}
                  >
                    <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.name} 
                      secondary={item.solution} 
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
        ),
        footer: (
          <Box component="footer" sx={{ 
            py: 3, 
            px: 2, 
            mt: 'auto', 
            bgcolor: 'background.paper',
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
            <Container maxWidth="lg">
              <Typography variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} Tribal Land Services - Secure Digital Platform
              </Typography>
            </Container>
          </Box>
        )
      }}
    >
      <React.Suspense fallback={<div>Loading...</div>}>
        <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
          <Routes>
            <Route index element={
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    Land Services Dashboard
                  </Typography>
                  
                  <SolutionHighlights 
                    solutions={[
                      "Digital Waitlist Tracking",
                      "Transparent Allocation Process",
                      "Automated Dispute Resolution",
                      "Secure Land Records"
                    ]}
                  />
                  
                  <WaitlistStatus 
                    position={waitlistPosition} 
                    estimatedTime={estimatedWaitTime} 
                    sx={{ mt: 3 }}
                  />
                </Box>

                <TransparencySection logs={transparencyLogs} sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                  {dashboardCards.map((card) => (
                    <Grid item xs={12} sm={6} md={4} key={card.path}>
                      <Card sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {card.icon}
                            <Typography variant="h6" sx={{ ml: 1.5 }}>
                              {card.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {card.description}
                          </Typography>
                        </CardContent>
                        <Box sx={{ p: 2 }}>
                          <Button
                            variant="contained"
                            onClick={() => handleNavigation(card.path)}
                            fullWidth
                            sx={{
                              bgcolor: 'primary.main',
                              '&:hover': { bgcolor: 'primary.dark' }
                            }}
                          >
                            Access Service
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            } />

            {navConfig.map((item) => (
              <Route 
                key={item.path} 
                path={item.path} 
                element={
                  item.path === "/" ? <LandingPage /> : 
                  item.path === "education-portal" ? <EducationPortal /> :
                  item.path === "view-land" ? <ViewLand /> :
                  item.path === "apply-land" ? <ApplyForLand /> :
                  item.path === "application-status" ? <ApplicationStatus /> :
                  item.path === "land-records" ? <LandRecords transparencyLogs={transparencyLogs} /> :
                  item.path === "report-dispute" ? <ReportDispute /> :
                  item.path === "profile" ? <Profile /> : null
                }
              />
            ))}
          </Routes>
        </Container>
      </React.Suspense>
    </MainLayout>
  );
};

export default CitizenDashboard;