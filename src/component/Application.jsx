/** @jsxRuntime classic */
/** @jsx React.createElement */

import { Assignment, Cancel, CheckCircle, DateRange, GpsFixed, HourglassEmpty, Person, Search } from '@mui/icons-material';
import { Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from '@mui/material';
import  React, { useEffect, useState } from 'react';
import { BotswanaRegions, LandPurposes } from './constants';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [filters, setFilters] = useState({
    region: '',
    purpose: '',
    dateRange: 'all'
  });

  useEffect(() => {
    // Simulate API call with Botswana-specific data
    setTimeout(() => {
      setApplications([
        {
          id: 'TL-APP-2023-001',
          applicant: 'Kgosietsile Molefe',
          idNumber: '1980123456',
          plotNumber: 'GAB-101',
          region: 'Gaborone',
          village: 'Mogoditshane',
          purpose: 'residential',
          date: '2023-05-10',
          status: 'pending',
          documents: ['ID Copy', 'Proof of Residence']
        },
        // More applications...
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const filteredApps = applications.filter(app => 
    (tabValue === 'all' || app.status === tabValue) &&
    (filters.region ? app.region === filters.region : true) &&
    (filters.purpose ? app.purpose === filters.purpose : true)
  );

  const renderStatusChip = (status) => {
    const colorMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      processed: 'info'
    };
    
    const iconMap = {
      pending: <HourglassEmpty />,
      approved: <CheckCircle />,
      rejected: <Cancel />,
      processed: <CheckCircle />
    };

    return (
      <Chip
        icon={iconMap[status]}
        label={status.toUpperCase()}
        color={colorMap[status]}
        size="small"
      />
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32' }}>
        <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
        Land Applications Management
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
        >
          <Tab label="All Applications" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="Approved" value="approved" />
          <Tab label="Rejected" value="rejected" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Region</InputLabel>
            <Select
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              label="Region"
            >
              <MenuItem value="">All Regions</MenuItem>
              {BotswanaRegions.map(region => (
                <MenuItem key={region} value={region}>{region}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Land Purpose</InputLabel>
            <Select
              value={filters.purpose}
              onChange={(e) => handleFilterChange('purpose', e.target.value)}
              label="Land Purpose"
            >
              <MenuItem value="">All Purposes</MenuItem>
              {LandPurposes.map(purpose => (
                <MenuItem key={purpose.value} value={purpose.value}>
                  {purpose.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search applications"
            InputProps={{ startAdornment: <Search /> }}
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#E8F5E9' }}>
            <TableRow>
              <TableCell>Application ID</TableCell>
              <TableCell>Applicant</TableCell>
              <TableCell>ID Number</TableCell>
              <TableCell>Plot Details</TableCell>
              <TableCell>Region/Village</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApps.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.id}</TableCell>
                <TableCell>{app.applicant}</TableCell>
                <TableCell>{app.idNumber}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GpsFixed sx={{ mr: 0.5, fontSize: 16 }} />
                    {app.plotNumber}
                  </Box>
                </TableCell>
                <TableCell>
                  {app.region} / {app.village}
                </TableCell>
                <TableCell>
                  {LandPurposes.find(p => p.value === app.purpose)?.label || app.purpose}
                </TableCell>
                <TableCell>{app.date}</TableCell>
                <TableCell>{renderStatusChip(app.status)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedApp(app);
                      setOpenDialog(true);
                    }}
                  >
                    Process
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Process Application: {selectedApp?.id}
        </DialogTitle>
        <DialogContent dividers>
          {selectedApp && (
            <Box>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Applicant Details
              </Typography>
              <Typography>Name: {selectedApp.applicant}</Typography>
              <Typography>ID Number: {selectedApp.idNumber}</Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                <GpsFixed sx={{ mr: 1, verticalAlign: 'middle' }} />
                Land Details
              </Typography>
              <Typography>Plot Number: {selectedApp.plotNumber}</Typography>
              <Typography>Region: {selectedApp.region}</Typography>
              <Typography>Village: {selectedApp.village}</Typography>
              <Typography>
                Purpose: {LandPurposes.find(p => p.value === selectedApp.purpose)?.label}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                <DateRange sx={{ mr: 1, verticalAlign: 'middle' }} />
                Application Documents
              </Typography>
              <ul>
                {selectedApp.documents.map((doc, index) => (
                  <li key={index}>
                    <Button size="small">View {doc}</Button>
                  </li>
                ))}
              </ul>
              
              <Divider sx={{ my: 2 }} />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Decision</InputLabel>
                <Select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  label="Decision"
                >
                  <MenuItem value="approve">Approve</MenuItem>
                  <MenuItem value="reject">Reject</MenuItem>
                  <MenuItem value="request-info">Request More Information</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comments/Reason"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // Submit decision to backend
              setOpenDialog(false);
            }}
          >
            Submit Decision
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Applications;