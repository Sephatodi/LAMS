/** @jsxRuntime classic */
/** @jsx React.createElement */
import {
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  Backup as BackupIcon,
  CheckCircle as CheckCircleIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Warning as DisputeIcon,
  Error as ErrorIcon,
  Gavel as GavelIcon,
  Layers as GISIcon,
  Help as HelpIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Logout as LogoutIcon,
  Map as MapIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Queue as QueueIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Alert,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Snackbar,
  styled,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Lazy-loaded components
const DashboardHome = React.lazy(() => import('../component/DashboardHome'));
const Profile = React.lazy(() => import('../component/Profile'));
const SettingsPage = React.lazy(() => import('../component/Settings'));
const AllocatedPlots = React.lazy(() => import('../component/AllocatedPlots'));
const AllocationQueue = React.lazy(() => import('../component/AllocationQueue'));
const AllocationTable = React.lazy(() => import('../component/AllocationTable'));
const DisputeDashboard = React.lazy(() => import('../component/DisputeDashboard'));
const LandRecords = React.lazy(() => import('../component/LandRecords'));
const LandRecordsMgmt = React.lazy(() => import('../component/LandRecordsMgmt'));
const Reports = React.lazy(() => import('../component/Reports'));
const TrainingModules = React.lazy(() => import('../component/TrainingModules'));
const BackupRestore = React.lazy(() => import('../component/BackupRestore'));
const CertificateDownload = React.lazy(() => import('../component/CertificateDownload'));
const QuickStats = React.lazy(() => import('../component/QuickStats'));
const ArcGISMap = React.lazy(() => import('../component/ArcGISMap'));
const PolygonDrawingMap = React.lazy(() => import('../component/maps/PolygonDrawingMap'));
const ConflictDetectionMap = React.lazy(() => import('../component/ConflictDetectionMap'));

// Navigation configuration
const navRoutes = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/staff',
    icon: <DashboardIcon fontSize="small" />,
    exact: true
  },
  {
    id: 'land-allocation',
    name: 'Land Allocation',
    icon: <AssignmentIcon fontSize="small" />,
    subRoutes: [
      { 
        id: 'allocation-queue',
        name: 'Allocation Queue', 
        path: '/staff/land-allocation/queue',
        icon: <QueueIcon fontSize="small" />
      },
      { 
        id: 'allocation-table',
        name: 'Allocation Table', 
        path: '/staff/land-allocation/table',
        icon: <AssignmentIcon fontSize="small" />
      },
      { 
        id: 'allocated-plots',
        name: 'Allocated Plots', 
        path: '/staff/land-allocation/allocated',
        icon: <MapIcon fontSize="small" />
      }
    ]
  },
  {
    id: 'dispute-resolution',
    name: 'Dispute Resolution',
    icon: <GavelIcon fontSize="small" />,
    subRoutes: [
      {
        id: 'active-disputes',
        name: 'Active Cases',
        path: '/staff/disputes/active',
        icon: <DisputeIcon fontSize="small" />
      },
      {
        id: 'dispute-reports',
        name: 'Case Reports',
        path: '/staff/disputes/reports',
        icon: <DescriptionIcon fontSize="small" />
      }
    ]
  },
  {
    id: 'land-records',
    name: 'Land Records',
    icon: <DescriptionIcon fontSize="small" />,
    subRoutes: [
      { 
        id: 'view-records',
        name: 'View Records', 
        path: '/staff/records',
        icon: <DescriptionIcon fontSize="small" />
      },
      { 
        id: 'records-management',
        name: 'Records Management', 
        path: '/staff/records/management',
        icon: <SettingsIcon fontSize="small" />
      }
    ]
  },
  {
    id: 'gis',
    name: 'GIS Analysis',
    icon: <GISIcon fontSize="small" />,
    subRoutes: [
      {
        id: 'gis-viewer',
        name: 'Map Viewer',
        path: '/staff/gis/viewer',
        icon: <MapIcon fontSize="small" />
      },
      {
        id: 'parcel-mapping',
        name: 'Parcel Mapping',
        path: '/staff/gis/mapping',
        icon: <MapIcon fontSize="small" />
      },
      {
        id: 'conflict-detection',
        name: 'Conflict Detection',
        path: '/staff/gis/conflicts',
        icon: <WarningIcon fontSize="small" />
      }
    ]
  },
  {
    id: 'reports',
    name: 'Reports',
    path: '/staff/reports',
    icon: <AssessmentIcon fontSize="small" />
  },
  {
    id: 'training',
    name: 'Training',
    path: '/staff/training',
    icon: <SchoolIcon fontSize="small" />
  },
  {
    id: 'certificates',
    name: 'Certificates',
    path: '/staff/certificates',
    icon: <DescriptionIcon fontSize="small" />
  },
  {
    id: 'admin',
    name: 'Administration',
    icon: <PersonIcon fontSize="small" />,
    subRoutes: [
      { 
        id: 'backup',
        name: 'Backup & Restore', 
        path: '/staff/admin/backup',
        icon: <BackupIcon fontSize="small" />
      },
      { 
        id: 'settings',
        name: 'System Settings', 
        path: '/staff/admin/settings',
        icon: <SettingsIcon fontSize="small" />
      }
    ]
  }
];

// Styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };
  
  return {
    backgroundColor: statusColors[status] || theme.palette.info.main,
    color: theme.palette.getContrastText(statusColors[status] || theme.palette.info.main),
    fontWeight: 'bold',
    fontSize: '0.7rem',
    height: 20,
    '& .MuiChip-label': {
      paddingLeft: 6,
      paddingRight: 6,
    },
  };
});

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const StaffNav = React.memo(function StaffNav({ 
  mobileOpen = false, 
  handleDrawerToggle = () => {}, 
  routes = navRoutes,
  isLoading = false 
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openSubMenu, setOpenSubMenu] = useState({});

  useEffect(() => {
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

  const handleSubMenuToggle = useCallback((id) => {
    setOpenSubMenu(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleNavigation = useCallback((path) => {
    if (isMobile) {
      handleDrawerToggle();
    }
    if (path) {
      navigate(path);
    }
  }, [isMobile, handleDrawerToggle, navigate]);

  const renderIcon = useCallback((route) => {
    return route?.icon || null;
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ 
        width: { md: 280 },
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

  const drawerContent = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        px: 2,
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.common.white
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MapIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            BLBMS
          </Typography>
        </Box>
        {isMobile && (
          <IconButton 
            onClick={handleDrawerToggle} 
            aria-label="close drawer"
            sx={{ color: theme.palette.common.white }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100] }}>
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
          MAIN NAVIGATION
        </Typography>
      </Box>
      <List sx={{ p: 1 }}>
        {routes.map((route) => {
          const isSelected = route.path 
            ? location.pathname === route.path
            : route.subRoutes?.some(sub => location.pathname === sub?.path);
          
          return (
            <React.Fragment key={route.id}>
              {route.subRoutes ? (
                <>
                  <ListItem 
                    disablePadding
                    onClick={() => handleSubMenuToggle(route.id)}
                    selected={isSelected || openSubMenu[route.id]}
                    aria-expanded={openSubMenu[route.id]}
                    aria-controls={`submenu-${route.id}`}
                  >
                    <ListItemButton
                      sx={{
                        borderRadius: 1,
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
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {React.cloneElement(renderIcon(route), { 
                          color: isSelected ? theme.palette.primary.main : 'inherit' 
                        })}
                      </ListItemIcon>
                      <ListItemText 
                        primary={route.name} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          color: isSelected ? theme.palette.primary.main : 'inherit'
                        }}
                      />
                      {openSubMenu[route.id] ? <ChevronRightIcon sx={{ transform: 'rotate(90deg)' }} /> : <ChevronRightIcon />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={openSubMenu[route.id]} timeout="auto" unmountOnExit id={`submenu-${route.id}`}>
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
                                backgroundColor: theme.palette.action.selected,
                                '&:hover': {
                                  backgroundColor: theme.palette.action.selected,
                                },
                              },
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {React.cloneElement(subRoute.icon || renderIcon(subRoute), {
                                color: location.pathname === subRoute.path ? theme.palette.primary.main : 'inherit'
                              })}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subRoute.name} 
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                fontWeight: location.pathname === subRoute.path ? 'bold' : 'normal',
                                color: location.pathname === subRoute.path ? theme.palette.primary.main : 'inherit'
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
                        backgroundColor: theme.palette.action.selected,
                        '&:hover': {
                          backgroundColor: theme.palette.action.selected,
                        },
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {React.cloneElement(renderIcon(route), {
                        color: location.pathname === route.path ? theme.palette.primary.main : 'inherit'
                      })}
                    </ListItemIcon>
                    <ListItemText 
                      primary={route.name} 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        fontWeight: location.pathname === route.path ? 'bold' : 'normal',
                        color: location.pathname === route.path ? theme.palette.primary.main : 'inherit'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Botswana Land Board Management System v2.0
        </Typography>
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
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
            width: 280,
            borderRight: 'none',
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
            width: 280,
            borderRight: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
});

const StaffDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { logout, user } = useAuth();
    
    // State management
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [systemStatus, setSystemStatus] = useState({
      database: 'online',
      gis: 'online',
      api: 'online',
      storage: 'online'
    });
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: '',
      severity: 'info'
    });
    const [showMap, setShowMap] = useState(false);
    const mapViewRef = useRef();
  
    const handleMapLoad = async (view) => {
      mapViewRef.current = view;
    };

    const filteredNotifications = useMemo(() => {
      return notifications.filter(notification => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !notification.read;
        return notification.type === activeTab;
      });
    }, [notifications, activeTab]);

    const unreadCount = useMemo(() => 
      notifications.filter(n => !n.read).length,
      [notifications]
    );

    const fetchNotifications = useCallback(async () => {
      try {
        const mockNotifications = [
          { 
            id: 1, 
            message: 'New land application submitted by John Doe', 
            time: new Date(Date.now() - 600000),
            read: false,
            status: 'new',
            type: 'application'
          },
          { 
            id: 2, 
            message: 'Dispute #LB-2023-045 requires immediate attention', 
            time: new Date(Date.now() - 3600000),
            read: false,
            status: 'urgent',
            type: 'dispute'
          },
          { 
            id: 3, 
            message: 'System maintenance scheduled for tomorrow', 
            time: new Date(Date.now() - 86400000),
            read: true,
            status: 'info',
            type: 'system'
          }
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message  || 'Failed to load notifications',
          severity: 'error'
        });
      }
    }, []);

    const checkSystemStatus = useCallback(async () => {
      try {
        const status = {
          database: 'online',
          gis: 'online',
          api: 'online',
          storage: 'online'
        };
        setSystemStatus(status);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error. message  ||'Failed to check system status',
          severity: 'error'
        });
      }
    }, []);

    useEffect(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          await Promise.all([fetchNotifications(), checkSystemStatus()]);
        } catch (error) {
          setSnackbar({
            open: true,
            message: error.message  || 'Failed to load dashboard data',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
      
      const statusInterval = setInterval(checkSystemStatus, 30000);
      const notificationInterval = setInterval(fetchNotifications, 60000);
      
      return () => {
        clearInterval(statusInterval);
        clearInterval(notificationInterval);
      };
    }, [fetchNotifications, checkSystemStatus]);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleNotificationClick = (event) => setNotificationAnchorEl(event.currentTarget);
    const handleNotificationClose = () => setNotificationAnchorEl(null);
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleTabChange = (event, newValue) => setActiveTab(newValue);
    const handleSnackbarClose = () => setSnackbar(prev => ({ ...prev, open: false }));
    const handleSearchChange = (event) => setSearchQuery(event.target.value);

    const markAsRead = useCallback((id) => {
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    }, []);

    const markAllAsRead = useCallback(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const handleNotificationAction = useCallback((notification) => {
      markAsRead(notification.id);
      handleNotificationClose();
      
      const navigationMap = {
        application: '/staff/land-allocation/queue',
        dispute: '/staff/disputes/active',
        survey: '/staff/gis',
        system: '/staff/admin/backup'
      };
      
      navigate(navigationMap[notification.type] || '/staff');
    }, [markAsRead, navigate]);

    const handleLogout = useCallback(() => {
      handleMenuClose();
      logout();
      navigate('/login');
    }, [logout, navigate]);

    const getStatusIcon = useCallback((status) => {
      const statusIcons = {
        online: <CheckCircleIcon fontSize="small" color="success" />,
        degraded: <ErrorIcon fontSize="small" color="warning" />,
        offline: <ErrorIcon fontSize="small" color="error" />,
      };
      return statusIcons[status] || <InfoIcon fontSize="small" color="info" />;
    }, []);

    const SystemStatusIndicators = React.memo(function SystemStatusIndicators() {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          {Object.entries(systemStatus).map(([key, status]) => (
            <Tooltip key={key} title={`${key.toUpperCase()}: ${status}`} arrow>
              <Box sx={{ ml: 1 }}>{getStatusIcon(status)}</Box>
            </Tooltip>
          ))}
        </Box>
      );
    });

    const currentPageTitle = useMemo(() => {
      const findTitle = (routes) => {
        for (const route of routes) {
          if (route.path && location.pathname === route.path) {
            return route.name;
          }
          if (route.subRoutes) {
            const subRoute = route.subRoutes.find(sub => location.pathname === sub.path);
            if (subRoute) return subRoute.name;
          }
        }
        return 'Dashboard';
      };
      
      return findTitle(navRoutes);
    }, [location.pathname]);

    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
        <CssBaseline />
        
        {isMobile && (
          <AppBar 
            position="fixed"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              bgcolor: '#2E7D32',
              boxShadow: 'none',
              display: { xs: 'flex', md: 'none' }
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                BLBMS
              </Typography>
            </Toolbar>
          </AppBar>
        )}
        
        <StaffNav mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
        
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1, 
            bgcolor: '#ffffff',
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[1],
            width: { md: `calc(100% - 280px)` },
            ml: { md: '280px' },
            display: { xs: 'none', md: 'flex' }
          }}
        >
          <Toolbar>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 'bold',
                color: theme.palette.primary.main
              }}
            >
              {currentPageTitle}
            </Typography>
            
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </Search>
            
            <SystemStatusIndicators />
            
            <Tooltip title="Help Center">
              <IconButton 
                color="inherit"
                onClick={() => navigate('/staff/training')}
                sx={{ mr: 1 }}
                aria-label="help"
              >
                <HelpIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit"
                onClick={handleNotificationClick}
                sx={{ mr: 1 }}
                aria-label="notifications"
              >
                <StyledBadge badgeContent={unreadCount} color="error">
                  <NotificationsIcon fontSize="medium" />
                </StyledBadge>
              </IconButton>
            </Tooltip>
            
            <Popover
              open={Boolean(notificationAnchorEl)}
              anchorEl={notificationAnchorEl}
              onClose={handleNotificationClose}
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
                  width: 400,
                  maxHeight: 500,
                  overflow: 'auto',
                  boxShadow: theme.shadows[6],
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
                  <Tab label="Disputes" value="dispute" />
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
                            notification.status === 'urgent' ? theme.palette.error.main :
                            notification.status === 'new' ? theme.palette.primary.main :
                            theme.palette.success.main
                          }`,
                          '&:hover': {
                            boxShadow: theme.shadows[2]
                          }
                        }}
                      >
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
                              <StatusChip 
                                label={notification.status}
                                status={
                                  notification.status === 'urgent' ? 'error' :
                                  notification.status === 'new' ? 'info' : 'success'
                                }
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Typography 
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDistanceToNow(notification.time, { addSuffix: true })}
                            </Typography>
                          </Box>
                        </MenuItem>
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
            
            <Tooltip title="Account settings">
              <IconButton onClick={handleMenuOpen} color="inherit" aria-label="user menu">
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.primary.main, 
                    color: theme.palette.common.white,
                    width: 36,
                    height: 36,
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {user?.initials || 'LB'}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
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
                  width: 280,
                  boxShadow: theme.shadows[4],
                  borderRadius: 2,
                  overflow: 'visible',
                  mt: 1.5,
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
              <MenuItem 
                onClick={() => {
                  handleMenuClose();
                  navigate('/staff/profile');
                }}
                sx={{ py: 1.5 }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    mr: 2, 
                    fontSize: '1rem',
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.common.white
                  }}
                >
                  {user?.initials || 'LB'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.name || 'Land Board User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.role || 'User'}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={() => {
                  handleMenuClose();
                  navigate('/staff');
                }}
              >
                <ListItemIcon>
                  <HomeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Dashboard</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleMenuClose();
                  navigate('/staff/profile');
                }}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>My Profile</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleMenuClose();
                  navigate('/staff/admin/settings');
                }}
              >
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: theme.palette.error.main }}>
                  Logout
                </ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
          {loading && <LinearProgress color="primary" />}
        </AppBar>

        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3,
            bgcolor: 'background.default',
            minHeight: '100vh',
            width: { xs: '100%', md: `calc(100% - 280px)` },
            ml: { xs: 0, md: '280px' },
            pt: { xs: '64px', md: '0' }
          }}
        >
          <Toolbar />
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              minHeight: 'calc(100vh - 64px)',
              backgroundColor: '#f5f7fa'
            }}
          >
            <Box sx={{ 
              mb: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                {currentPageTitle}
              </Typography>
              <Box>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/staff/training')}
                  startIcon={<HelpIcon />}
                  sx={{ mr: 2 }}
                >
                  Help
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => window.print()}
                  startIcon={<DescriptionIcon />}
                >
                  Print
                </Button>
              </Box>
            </Box>
            
            <React.Suspense fallback={<CircularProgress />}>
              <QuickStats />
            </React.Suspense>
            
            <Box 
              sx={{ 
                flexGrow: 1,
                mt: 3,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                p: 3,
                minHeight: '60vh'
              }}
            >
              <React.Suspense fallback={
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '60vh' 
                }}>
                  <CircularProgress size={60} />
                </Box>
              }>
                <Routes>
                  <Route index element={<DashboardHome />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="admin/settings" element={<SettingsPage />} />
                  <Route path="land-allocation">
                    <Route path="allocated" element={
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <AllocatedPlots onShowMap={() => setShowMap(true)} />
                        {showMap && (
                          <Box sx={{ flex: 1, mt: 2 }}>
                            <Suspense fallback={<LinearProgress />}>
                              <ArcGISMap onMapLoad={handleMapLoad} />
                            </Suspense>
                          </Box>
                        )}
                      </Box>
                    } />
                    <Route path="queue" element={<AllocationQueue />} />
                    <Route path="table" element={<AllocationTable />} />
                  </Route>
                  <Route path="disputes">
                    <Route path="active" element={<DisputeDashboard />} />
                    <Route path="reports" element={<Reports />} />
                  </Route>
                  <Route path="records">
                    <Route index element={<LandRecords />} />
                    <Route path="management" element={<LandRecordsMgmt />} />
                  </Route>
                  <Route path="gis">
                    <Route path="viewer" element={
                      <Box sx={{ height: 'calc(100vh - 200px)' }}>
                        <Suspense fallback={<LinearProgress />}>
                          <ArcGISMap onMapLoad={handleMapLoad} />
                        </Suspense>
                      </Box>
                    } />
                    <Route path="mapping" element={
                      <Box sx={{ height: 'calc(100vh - 200px)' }}>
                        <Suspense fallback={<LinearProgress />}>
                          <PolygonDrawingMap onMapLoad={handleMapLoad} />
                        </Suspense>
                      </Box>
                    } />
                    <Route path="conflicts" element={
                      <Box sx={{ height: 'calc(100vh - 200px)' }}>
                        <Suspense fallback={<LinearProgress />}>
                          <ConflictDetectionMap onMapLoad={handleMapLoad} />
                        </Suspense>
                      </Box>
                    } />
                  </Route>
                  <Route path="admin/backup" element={<BackupRestore />} />
                  <Route path="certificates" element={<CertificateDownload />} />
                  <Route path="training" element={<TrainingModules />} />
                </Routes>
              </React.Suspense>
              <Outlet />
            </Box>
            
            <Box sx={{ 
              mt: 3,
              py: 2,
              textAlign: 'center',
              color: 'text.secondary'
            }}>
              <Typography variant="body2">
                Botswana Land Board Management System © {new Date().getFullYear()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
};

export default StaffDashboard;