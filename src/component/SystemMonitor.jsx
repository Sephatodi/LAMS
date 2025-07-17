/** @jsxRuntime classic */
/** @jsx React.createElement */


import { Memory, Refresh, Speed, Storage, Warning } from '@mui/icons-material';
import {
    Box,
    Button,
    Card, CardContent,
    Chip,
    Container,
    Grid,
    LinearProgress, Table, TableBody, TableCell, TableContainer,
    TableRow,
    Typography
} from '@mui/material';
import  React, { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const SystemMonitor = () => {
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      // Simulate API call
      setTimeout(() => {
        setSystemStats({
          cpuUsage: 45,
          memoryUsage: 78,
          diskUsage: 62,
          uptime: '12 days, 6 hours',
          activeUsers: 24,
          responseTime: 342,
          alerts: [
            { id: 1, severity: 'warning', message: 'Memory usage high', timestamp: '2023-06-15 09:42' },
            // More alerts...
          ],
          performanceData: [
            { time: '00:00', cpu: 35, memory: 65 },
            // More data points...
          ]
        });
        setLoading(false);
      }, 800);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
            System Monitoring
          </Typography>
          <Button startIcon={<Refresh />}>
            Refresh Data
          </Button>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={3}>
            {/* Status Cards */}
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" color="textSecondary">
                      CPU Usage
                    </Typography>
                    <Memory color="primary" />
                  </Box>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    {systemStats.cpuUsage}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemStats.cpuUsage} 
                    sx={{ mt: 2, height: 8 }}
                    color={systemStats.cpuUsage > 80 ? 'error' : systemStats.cpuUsage > 60 ? 'warning' : 'primary'}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" color="textSecondary">
                      Memory Usage
                    </Typography>
                    <Storage color="primary" />
                  </Box>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    {systemStats.memoryUsage}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemStats.memoryUsage} 
                    sx={{ mt: 2, height: 8 }}
                    color={systemStats.memoryUsage > 85 ? 'error' : systemStats.memoryUsage > 70 ? 'warning' : 'primary'}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* More status cards... */}

            {/* Performance Chart */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Trends (Last 24 Hours)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={systemStats.performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="cpu" 
                          stroke="#1976d2" 
                          activeDot={{ r: 6 }} 
                          name="CPU %"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="memory" 
                          stroke="#4caf50" 
                          name="Memory %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Alerts */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                    System Alerts
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {systemStats.alerts.map((alert) => (
                          <TableRow key={alert.id}>
                            <TableCell>
                              <Chip 
                                label={alert.severity} 
                                size="small"
                                color={alert.severity === 'critical' ? 'error' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>{alert.message}</TableCell>
                            <TableCell>{alert.timestamp}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default SystemMonitor;