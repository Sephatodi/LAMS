/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import {
    Assessment,
    Assignment,
    Cloud,
    Gavel,
    Map,
    MonetizationOn,
    People,
    Refresh,
    Warning
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    LinearProgress,
    Typography
} from '@mui/material';

const QuickStats = () => {
  // Sample data - in a real app, this would come from API calls
  const stats = {
    pendingApplications: 42,
    allocatedPlots: 1286,
    activeUsers: 24,
    openDisputes: 7,
    storageUsage: 65,
    systemAlerts: 2,
    lastBackup: '2023-06-15 02:00',
    uptime: '99.95%',
    monthlyRevenue: 245000,
    outstandingPayments: 78000,
    overdueAccounts: 42
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          System Overview
        </Typography>
        <Button 
          size="small" 
          startIcon={<Refresh />}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Financial KPIs */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Revenue
                </Typography>
                <MonetizationOn color="success" />
              </Box>
              <Typography variant="h4">BWP {(stats.monthlyRevenue / 1000).toFixed(0)}K</Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="+8% from last month" 
                  size="small" 
                  color="success"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="textSecondary" gutterBottom>
                  Outstanding Payments
                </Typography>
                <Warning color="error" />
              </Box>
              <Typography variant="h4">BWP {(stats.outstandingPayments / 1000).toFixed(0)}K</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption">
                  {stats.overdueAccounts} overdue accounts
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Applications */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="textSecondary" gutterBottom>
                  Pending Applications
                </Typography>
                <Assignment color="primary" />
              </Box>
              <Typography variant="h4">{stats.pendingApplications}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="caption" sx={{ mr: 1 }}>
                  Queue Status:
                </Typography>
                <Chip 
                  label={stats.pendingApplications > 50 ? 'High' : 'Normal'} 
                  size="small"
                  color={stats.pendingApplications > 50 ? 'error' : 'primary'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Allocated Plots */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="textSecondary" gutterBottom>
                  Allocated Plots
                </Typography>
                <Map color="success" />
              </Box>
              <Typography variant="h4">{stats.allocatedPlots.toLocaleString()}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Last 30 days: +24
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="textSecondary" gutterBottom>
                  Active Users
                </Typography>
                <People color="secondary" />
              </Box>
              <Typography variant="h4">{stats.activeUsers}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Currently online
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Open Disputes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="textSecondary" gutterBottom>
                  Open Disputes
                </Typography>
                <Gavel color="warning" />
              </Box>
              <Typography variant="h4">{stats.openDisputes}</Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="3 overdue" 
                  size="small" 
                  color="error"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health Row */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="textSecondary" gutterBottom>
                  System Health
                </Typography>
                <Assessment color="info" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" component="span" sx={{ mr: 2 }}>
                  Uptime: 
                </Typography>
                <Chip 
                  label={stats.uptime} 
                  color={stats.uptime === '100%' ? 'success' : 'default'}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Storage:
                </Typography>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.storageUsage} 
                    color={stats.storageUsage > 80 ? 'error' : 'primary'}
                  />
                </Box>
                <Typography variant="body2">
                  {stats.storageUsage}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="textSecondary" gutterBottom>
                  System Alerts
                </Typography>
                <Warning color="error" />
              </Box>
              {stats.systemAlerts > 0 ? (
                <>
                  <Typography variant="h4" color="error">
                    {stats.systemAlerts}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {stats.systemAlerts === 1 ? '1 critical issue' : `${stats.systemAlerts} critical issues`}
                  </Typography>
                </>
              ) : (
                <Typography variant="h6" color="success">
                  All systems normal
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Backup Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="textSecondary" gutterBottom>
                  Backup Status
                </Typography>
                <Cloud color="action" />
              </Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Last Backup: {stats.lastBackup}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  label="Successful" 
                  color="success" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
                <Typography variant="caption">
                  Next backup in 3 hours
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuickStats;