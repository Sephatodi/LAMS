/** @jsxRuntime classic */
/** @jsx React.createElement */


import { Assessment, GridOn, PictureAsPdf } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Container, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import  React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const Reports = () => {
  const [reportType, setReportType] = useState('allocations');
  const [timePeriod, setTimePeriod] = useState('month');

  const data = [
    { name: 'Jan', allocations: 12, disputes: 2 },
    { name: 'Feb', allocations: 19, disputes: 3 },
    // More data...
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Land Services Reports
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="allocations">Allocations</MenuItem>
              <MenuItem value="disputes">Disputes</MenuItem>
              <MenuItem value="queue">Queue Statistics</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          
          <Box>
            <Button startIcon={<PictureAsPdf />} sx={{ mr: 1 }}>Export PDF</Button>
            <Button startIcon={<GridOn />}>Export Excel</Button>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {reportType === 'allocations' ? 'Land Allocations' : 
                   reportType === 'disputes' ? 'Land Disputes' : 'Application Queue'} Statistics
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={reportType === 'allocations' ? 'allocations' : 'disputes'} fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography>Total Allocations</Typography>
                      <Typography variant="h4">142</Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography>Pending Applications</Typography>
                      <Typography variant="h4">28</Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography>Active Disputes</Typography>
                      <Typography variant="h4">5</Typography>
                    </CardContent>
                  </Card>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Reports;