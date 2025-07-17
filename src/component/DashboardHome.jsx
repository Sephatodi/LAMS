/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    History as ActivityIcon,
    Assignment as AllocationIcon,
    CalendarToday as DeadlineIcon,
    Gavel as DisputeIcon,
    Layers as GISIcon,
    Notifications as NotificationsIcon,
    AccessTime as PendingIcon,
    Queue as QueueIcon,
    Description as RecordsIcon,
    Assessment as ReportsIcon,
    CheckCircle as ResolvedIcon,
    Warning as UrgentIcon
} from '@mui/icons-material';
import {
    Alert,
    Badge,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    IconButton,
    List, ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Skeleton,
    Tooltip,
    Typography
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AllocationWizard from './AllocationWizard';
import ConflictDetectionMap from './ConflictDetectionMap';

const DashboardHome = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();
    
    const [state, setState] = useState({
      showAllocationWizard: false,
      gisPreview: null,
      priorityQueue: [],
      summaryStats: null,
      notifications: [],
      recentActivities: [],
      loading: true,
      error: null
    });
  
    // Memoized priority calculation
    const calculatePriorityScore = useCallback((application) => {
      const weights = {
        waitingYears: 15,
        isDisabled: 50,
        isElderly: 30,
        isFirstTimeApplicant: 20,
        hasUrgentHousingNeed: 40
      };
      
      return Object.entries(weights).reduce((score, [key, weight]) => {
        return score + (application[key] ? weight : 0);
      }, 0);
    }, []);
  
    // Unified data fetcher with error handling
    const fetchDashboardData = useCallback(async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const endpoints = [
          '/api/allocations/queue',
          '/api/dashboard/summary',
          '/api/notifications',
          '/api/activities/recent'
        ];
  
        const responses = await Promise.all(
          endpoints.map(url => fetch(url).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
            return res.json();
          }))
        );
  
        const [queueData, summaryData, notifications, activities] = responses;
  
        // Validate and process queue data
        const prioritizedQueue = Array.isArray(queueData) 
          ? queueData.map(app => ({
              ...app,
              score: calculatePriorityScore(app)
            })).sort((a, b) => b.score - a.score)
          : [];
  
        setState({
          showAllocationWizard: false,
          gisPreview: null,
          priorityQueue: prioritizedQueue,
          summaryStats: summaryData,
          notifications: Array.isArray(notifications) ? notifications.filter(n => !n.dismissed) : [],
          recentActivities: Array.isArray(activities) ? activities.slice(0, 5) : [],
          loading: false,
          error: null
        });
  
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
      }
    }, [calculatePriorityScore, enqueueSnackbar]);
  
    useEffect(() => {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }, [fetchDashboardData]);
  
    // Notification dismissal handler
    const handleDismissNotification = async (notificationId) => {
      try {
        await fetch(`/api/notifications/${notificationId}/dismiss`, { method: 'POST' });
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId)
        }));
      } catch (error) {
        enqueueSnackbar(error.message  ||'Failed to dismiss notification', { variant: 'error' });
      }
    };
  
    // Quick Actions configuration
    const quickActions = [
      { 
        title: 'Process New Allocation',
        icon: <AllocationIcon fontSize="large" />,
        path: 'allocation-table',
        action: () => setState(prev => ({ ...prev, showAllocationWizard: true })),
        gis: true,
        permission: 'allocation.create'
      },
      { 
        title: 'Manage Allocation Queue',
        icon: <QueueIcon fontSize="large" />,
        path: 'queue-management',
        badge: state.priorityQueue.length,
        analytics: true,
        permission: 'queue.manage'
      },
      { 
        title: 'Resolve Dispute',
        icon: <DisputeIcon fontSize="large" />,
        path: 'dispute-resolution',
        restricted: true,
        permission: 'dispute.resolve'
      },
      { 
        title: 'Update Land Records',
        icon: <RecordsIcon fontSize="large" />,
        path: 'land-records',
        blockchain: true,
        permission: 'records.update'
      },
      { 
        title: 'Generate Reports',
        icon: <ReportsIcon fontSize="large" />,
        path: 'reports',
        permission: 'reports.generate'
      }
    ];
  
    // Render summary statistics cards
    const renderSummaryCards = () => {
      if (state.loading) {
        return (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
            ))}
          </Grid>
        );
      }
  
      if (!state.summaryStats) {
        return <Alert severity="error">Summary statistics unavailable</Alert>;
      }
  
      const stats = [
        { 
          label: 'Total Allocated', 
          value: state.summaryStats.totalAllocated || 0,
          icon: <AllocationIcon color="success" />,
          trend: state.summaryStats.allocationTrend || 0
        },
        { 
          label: 'Pending Applications', 
          value: state.summaryStats.pendingApplications || 0,
          icon: <PendingIcon color="warning" />,
          trend: state.summaryStats.applicationTrend || 0
        },
        { 
          label: 'Resolved Disputes', 
          value: state.summaryStats.resolvedDisputes || 0,
          icon: <ResolvedIcon color="info" />,
          trend: state.summaryStats.disputeResolutionRate || 0
        },
        { 
          label: 'Urgent Cases', 
          value: Array.isArray(state.priorityQueue) ? state.priorityQueue.filter(app => app.score > 75).length : 0,
          icon: <UrgentIcon color="error" />,
          trend: null
        }
      ];
  
      return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: 'action.active' }}>
                    {stat.icon}
                  </Box>
                </Box>
                {stat.trend !== null && (
                  <Typography variant="caption" color={stat.trend > 0 ? 'success.main' : 'error.main'}>
                    {stat.trend > 0 ? '↑' : '↓'} {Math.abs(stat.trend)}% from last period
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      );
    };
  
    // Render notifications panel
    const renderNotifications = () => {
      if (state.loading) return <Skeleton variant="rectangular" height={150} />;
  
      const urgentNotifications = state.notifications?.filter(n => n.priority === 'high') || [];
      const regularNotifications = state.notifications?.filter(n => n.priority !== 'high') || [];
  
      return (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <NotificationsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Alerts & Notifications
              <Chip 
                label={`${state.notifications?.length || 0} active`} 
                size="small" 
                color="primary"
                sx={{ ml: 1 }} 
              />
            </Typography>
          </Box>
  
          {urgentNotifications.length > 0 && (
            <>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Urgent Alerts
              </Typography>
              {urgentNotifications.map(notification => (
                <Alert 
                  key={notification.id}
                  severity="error"
                  sx={{ mb: 1 }}
                  action={
                    <IconButton
                      size="small"
                      onClick={() => handleDismissNotification(notification.id)}
                    >
                      &times;
                    </IconButton>
                  }
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {notification.title}
                    </Typography>
                    <Typography variant="body2">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {formatDistanceToNow(new Date(notification.timestamp))} ago
                      {notification.deadline && (
                        <>
                          • Deadline: <DeadlineIcon fontSize="inherit" /> {new Date(notification.deadline).toLocaleDateString()}
                        </>
                      )}
                    </Typography>
                  </Box>
                </Alert>
              ))}
              <Divider sx={{ my: 2 }} />
            </>
          )}
  
          {regularNotifications.length > 0 ? (
            regularNotifications.map(notification => (
              <Alert
                key={notification.id}
                severity={notification.priority === 'medium' ? 'warning' : 'info'}
                sx={{ mb: 1 }}
                onClose={() => handleDismissNotification(notification.id)}
              >
                <Typography variant="body2">
                  {notification.message}
                </Typography>
              </Alert>
            ))
          ) : (
            <Alert severity="info">No active notifications</Alert>
          )}
        </Paper>
      );
    };
  
    // Render activity log
    const renderActivityLog = () => {
      if (state.loading) return <Skeleton variant="rectangular" height={200} />;
  
      return (
        <Paper sx={{ p: 2, height: '100%' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <ActivityIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Recent Activity
            </Typography>
          </Box>
  
          {state.recentActivities?.length > 0 ? (
            <List dense>
              {state.recentActivities.map(activity => (
                <ListItem 
                  key={activity.id} 
                  button
                  onClick={() => navigate(`/${activity.type}s/${activity.id}`)}
                >
                  <ListItemIcon>
                    {activity.type === 'allocation' ? (
                      <AllocationIcon color="primary" />
                    ) : activity.type === 'dispute' ? (
                      <DisputeIcon color="secondary" />
                    ) : (
                      <RecordsIcon color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.description}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          {activity.user}
                        </Typography>
                        {` — ${formatDistanceToNow(new Date(activity.timestamp))} ago`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No recent activity</Alert>
          )}
        </Paper>
      );
    };
  
    return (
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Land Management Dashboard
          </Typography>
          <Box>
            <Tooltip title="GIS Analysis">
              <IconButton onClick={() => navigate('gis-analysis')}>
                <GISIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton onClick={() => navigate('notifications')}>
                <Badge 
                  badgeContent={state.notifications?.length || 0} 
                  color="error"
                >
                  <NotificationsIcon fontSize="large" />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
  
        {state.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Dashboard error: {state.error}
          </Alert>
        )}
  
        {/* Summary Statistics Section */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Summary Overview
        </Typography>
        {renderSummaryCards()}
  
        {/* Notifications Section */}
        {renderNotifications()}
  
        {/* Quick Actions Section */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickActions.map((action) => (
            (action.restricted && !user?.permissions?.includes(action.permission)) ? null : (
              <Grid item xs={12} sm={6} md={3} key={action.title}>
                <Paper 
                  elevation={3}
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={action.action || (() => navigate(action.path))}
                >
                  {action.badge && (
                    <Badge 
                      badgeContent={action.badge} 
                      color="error"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                  )}
                  <Box sx={{ color: 'primary.main', mb: 1.5 }}>
                    {action.icon}
                  </Box>
                  <Typography 
                    variant="subtitle1" 
                    align="center" 
                    sx={{ fontWeight: 'medium' }}
                  >
                    {action.title}
                  </Typography>
                  {action.gis && (
                    <Chip 
                      label="GIS Integrated" 
                      size="small" 
                      sx={{ mt: 1 }} 
                      color="primary"
                    />
                  )}
                </Paper>
              </Grid>
            )
          ))}
        </Grid>
  
        {/* Main Content Section */}
        <Grid container spacing={3}>
          {/* Conflict Map */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Conflict Detection Map
              </Typography>
              <ConflictDetectionMap 
                height={400}
                onConflictSelect={(conflict) => navigate(`dispute-resolution/${conflict.id}`)}
              />
            </Paper>
          </Grid>
  
          {/* Activity Log */}
          <Grid item xs={12} md={4}>
            {renderActivityLog()}
          </Grid>
        </Grid>
  
        {/* Allocation Wizard */}
        <AllocationWizard
          open={state.showAllocationWizard}
          onClose={() => setState(prev => ({ ...prev, showAllocationWizard: false }))}
          onComplete={(newAllocation) => {
            setState(prev => ({ ...prev, gisPreview: newAllocation.plotLocation }));
            navigate('gis-analysis', { state: { newAllocation } });
          }}
        />
  
        {/* Admin Tools Section */}
        {user?.role === 'admin' && (
          <Paper sx={{ p: 2, mt: 4, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Administrator Tools
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={() => navigate('admin-tools')}
                >
                  System Administration
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={() => navigate('blockchain-audit')}
                >
                  Blockchain Verification
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={() => navigate('reports')}
                >
                  Generate Reports
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    );
  };
  
  export default DashboardHome;