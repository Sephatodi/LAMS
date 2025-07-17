/** @jsxRuntime classic */
/** @jsx React.createElement */


import { Download, GridOn, PictureAsPdf } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl, InputLabel,
    MenuItem,
    Paper,
    Select,
    Tab,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow,
    Tabs,
    Typography
} from '@mui/material';
import axios from 'axios';
import  React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ReportingTools = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState('allocations');
  const [timePeriod, setTimePeriod] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reportTypes = [
    { value: 'allocations', label: 'Land Allocations' },
    { value: 'disputes', label: 'Disputes' },
    { value: 'applications', label: 'Applications' },
    { value: 'revenue', label: 'Revenue' }
  ];

  const timePeriods = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reports?type=${reportType}&period=${timePeriod}`);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, timePeriod]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDownload = (format) => {
    // In a real app, this would generate and download the report
    console.log(`Downloading ${reportType} report as ${format}`);
  };

  const renderChart = () => {
    if (!reportData?.chartData) return null;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={reportData.chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderTable = () => {
    if (!reportData?.tableData) return null;

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              {reportData.tableHeaders.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.tableData.map((row, index) => (
              <TableRow key={index}>
                {reportData.tableHeaders.map((header) => (
                  <TableCell key={header}>{row[header]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reporting Tools
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label="Report Type"
            >
              {reportTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              label="Time Period"
            >
              {timePeriods.map((period) => (
                <MenuItem key={period.value} value={period.value}>{period.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => handleDownload('csv')}
            disabled={loading}
          >
            CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={() => handleDownload('pdf')}
            disabled={loading}
          >
            PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<GridOn />}
            onClick={() => handleDownload('excel')}
            disabled={loading}
          >
            Excel
          </Button>
        </Box>
        
        <Paper sx={{ p: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Summary" />
            <Tab label="Chart View" />
            <Tab label="Detailed Data" />
          </Tabs>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {reportData?.summary?.title || 'Report Summary'}
                  </Typography>
                  <Typography paragraph>
                    {reportData?.summary?.description || 'No summary available'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                    {reportData?.summary?.metrics?.map((metric, index) => (
                      <Paper key={index} sx={{ p: 2, minWidth: 150, textAlign: 'center' }}>
                        <Typography variant="h6">{metric.value}</Typography>
                        <Typography variant="body2">{metric.label}</Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}
              
              {tabValue === 1 && renderChart()}
              
              {tabValue === 2 && renderTable()}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ReportingTools;