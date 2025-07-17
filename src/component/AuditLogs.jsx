/** @jsxRuntime classic */
/** @jsx React.createElement */

import { Analytics, Clear, Flag, History, Search } from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    actionType: '',
    user: '',
    dateRange: '7days'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [_selectedLog, setSelectedLog] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const api = useApi();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLogs([
        {
          id: 1,
          timestamp: '2023-06-15 09:42:15',
          user: 'admin@landboard.gov.bw',
          action: 'USER_CREATED',
          target: 'staff@landboard.gov.bw',
          ip: '196.220.42.12'
        },
        {
          id: 2,
          timestamp: '2023-06-15 22:15:33',
          user: 'temp_user@landboard.gov.bw',
          action: 'ALLOCATION_MODIFIED',
          target: 'PLOT-12345',
          ip: '196.220.42.15'
        },
        // More logs...
      ]);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    const detectSuspiciousActivities = () => {
      const suspicious = logs.filter(log => 
        (log.action === 'ALLOCATION_MODIFIED' && 
         new Date(log.timestamp).getHours() > 20) || // After hours activity
        log.user.includes('temp') || // Temporary accounts
        log.ip.startsWith('196.220.42') // Suspicious IP range
      );
      setSuspiciousActivities(suspicious);
      
      if (suspicious.length > 0) {
        enqueueSnackbar(`${suspicious.length} suspicious activities detected`, { 
          variant: 'warning',
          autoHideDuration: null,
          action: (
            <Button color="inherit" onClick={() => setFilters({...filters, highlight: 'suspicious'})}>
              View
            </Button>
          )
        });
      }
    };
    
    if (logs.length > 0) {
      detectSuspiciousActivities();
    }
  }, [enqueueSnackbar, filters, logs]);

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      actionType: '',
      user: '',
      dateRange: '7days'
    });
    setSearchTerm('');
  };

  const analyzeLogPatterns = async () => {
    try {
      setLoading(true);
      const response = await api.post('/audit/analyze', {
        filters,
        logs: filteredLogs
      });
      setAnalysisResults(response.data);
      enqueueSnackbar('Analysis completed successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message  || 'Analysis failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    (filters.actionType ? log.action === filters.actionType : true) &&
    (filters.user ? log.user.includes(filters.user) : true) &&
    (searchTerm ? 
      log.user.includes(searchTerm) || 
      log.target.includes(searchTerm) || 
      log.ip.includes(searchTerm) : true)
  );

  const actionTypeColor = (action) => {
    if (action.includes('CREATE')) return 'success';
    if (action.includes('DELETE')) return 'error';
    if (action.includes('UPDATE')) return 'warning';
    return 'primary';
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 3 }}>
        <Typography variant="h4" gutterBottom>
          <History sx={{ mr: 1, verticalAlign: 'middle' }} />
          System Audit Logs
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search logs"
                InputProps={{ startAdornment: <Search /> }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Action Type</InputLabel>
                <Select
                  value={filters.actionType}
                  onChange={(e) => handleFilterChange('actionType', e.target.value)}
                  label="Action Type"
                >
                  <MenuItem value="">All Actions</MenuItem>
                  <MenuItem value="USER_CREATED">User Created</MenuItem>
                  <MenuItem value="USER_UPDATED">User Updated</MenuItem>
                  <MenuItem value="USER_DELETED">User Deleted</MenuItem>
                  <MenuItem value="LOGIN">Login</MenuItem>
                  <MenuItem value="LOGOUT">Logout</MenuItem>
                  <MenuItem value="RECORD_MODIFIED">Record Modified</MenuItem>
                  <MenuItem value="ALLOCATION_MODIFIED">Allocation Modified</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="1day">Last 24 Hours</MenuItem>
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearFilters}
                fullWidth
                sx={{ height: '56px' }}
              >
                Clear Filters
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<Analytics />}
                onClick={analyzeLogPatterns}
                fullWidth
                sx={{ height: '56px', mr: 1 }}
              >
                Analyze Patterns
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#e3f2fd' }}>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Details</TableCell>
                <TableCell width={50}>Flags</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow 
                  key={log.id}
                  sx={{ 
                    bgcolor: suspiciousActivities.some(a => a.id === log.id) ? '#fff8e1' : 'inherit',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <Chip 
                      label={log.action.replace(/_/g, ' ')} 
                      color={actionTypeColor(log.action)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.target}</TableCell>
                  <TableCell>{log.ip}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => setSelectedLog(log)}>
                      View Details
                    </Button>
                  </TableCell>
                  <TableCell>
                    {suspiciousActivities.some(a => a.id === log.id) && (
                      <Tooltip title="Suspicious Activity">
                        <Flag color="error" fontSize="small" />
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {analysisResults && (
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Forensic Analysis Results
            </Typography>
            <pre>{JSON.stringify(analysisResults, null, 2)}</pre>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default AuditLogs;