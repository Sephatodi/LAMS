/** @jsxRuntime classic */
/** @jsx React.createElement */


import {
    Task as ApprovedIcon,
    Check as ApproveIcon,
    Clear as ClearIcon,
    Description as DetailsIcon,
    Email as EmailIcon,
    FilterList as FilterIcon,
    LocationOn as LocationIcon,
    MoreVert as MoreIcon,
    Schedule as PendingIcon,
    Phone as PhoneIcon,
    Refresh as RefreshIcon,
    Block as RejectedIcon,
    Close as RejectIcon,
    Info as RequestInfoIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    Menu,
    MenuItem,
    Pagination,
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
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import useApi from '../hooks/useApi';

// Constants
const _APPLICATION_STRUCTURE = {
  id: '',
  applicantId: '',
  applicantName: '',
  applicantPhoto: '',
  idNumber: '',
  email: '',
  phone: '',
  preferredLocation: '',
  preferredWard: '',
  preferredVillage: '',
  plotType: 'residential',
  applicationDate: '',
  status: 'pending',
  lastUpdated: '',
  notes: '',
  documents: [],
  priorityScore: 0
};

const DEFAULT_FILTER_OPTIONS = {
  status: '',
  plotType: '',
  ward: '',
  village: '',
  startDate: null,
  endDate: null,
  searchQuery: '',
  priority: ''
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: <PendingIcon />, color: 'warning' },
  { value: 'approved', label: 'Approved', icon: <ApprovedIcon />, color: 'success' },
  { value: 'rejected', label: 'Rejected', icon: <RejectedIcon />, color: 'error' },
  { value: 'needs_info', label: 'Needs Info', icon: <RequestInfoIcon />, color: 'info' }
];

const PLOT_TYPE_OPTIONS = [
  { value: 'residential', label: 'Residential', color: 'primary' },
  { value: 'commercial', label: 'Commercial', color: 'secondary' },
  { value: 'agricultural', label: 'Agricultural', color: 'success' },
  { value: 'industrial', label: 'Industrial', color: 'info' }
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

// Helper Components
const StatusChip = ({ status }) => {
  const statusData = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
  return (
    <Chip
      icon={statusData.icon}
      label={statusData.label}
      color={statusData.color}
      size="small"
      variant="outlined"
    />
  );
};

const PlotTypeChip = ({ type }) => {
  const typeData = PLOT_TYPE_OPTIONS.find(opt => opt.value === type) || PLOT_TYPE_OPTIONS[0];
  return <Chip label={typeData.label} color={typeData.color} size="small" />;
};

const PriorityChip = ({ score }) => {
  const getPriorityLevel = (score) => {
    if (score > 75) return { label: 'High', color: 'error' };
    if (score > 50) return { label: 'Medium', color: 'warning' };
    return { label: 'Low', color: 'success' };
  };

  const priority = getPriorityLevel(score);
  return <Chip label={`${score || 0} (${priority.label})`} color={priority.color} size="small" />;
};

// Main Component
const AllocationQueue = () => {
  const { enqueueSnackbar } = useSnackbar();
  const api = useApi();
  
  const [state, setState] = useState({
    applications: [],
    loading: true,
    error: null,
    filterOptions: DEFAULT_FILTER_OPTIONS,
    selectedApplication: null,
    actionDialog: { open: false, action: '', notes: '' },
    processing: false,
    pagination: { page: 1, rowsPerPage: 10, totalCount: 0 },
    detailDialogOpen: false,
    menuAnchorEl: null
  });

  // GIS related state
  const [gisData, setGisData] = useState(null);
  const [selectedApplicationLocation, setSelectedApplicationLocation] = useState(null);

  // Derived state
  const filterOptionsData = useMemo(() => {
    const wards = new Set();
    const villages = new Set();

    state.applications.forEach(app => {
      if (app.preferredWard) wards.add(app.preferredWard);
      if (app.preferredVillage) villages.add(app.preferredVillage);
    });

    return {
      wards: Array.from(wards),
      villages: Array.from(villages)
    };
  }, [state.applications]);

  // API calls
  const fetchApplications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const params = new URLSearchParams();
      const { filterOptions, pagination } = state;

      if (filterOptions.status) params.append('status', filterOptions.status);
      if (filterOptions.plotType) params.append('plotType', filterOptions.plotType);
      if (filterOptions.ward) params.append('ward', filterOptions.ward);
      if (filterOptions.village) params.append('village', filterOptions.village);
      if (filterOptions.startDate) params.append('startDate', filterOptions.startDate);
      if (filterOptions.endDate) params.append('endDate', filterOptions.endDate);
      if (filterOptions.searchQuery) params.append('search', filterOptions.searchQuery);
      if (filterOptions.priority) params.append('priority', filterOptions.priority);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.rowsPerPage.toString());

      const response = await api.get(`/applications?${params.toString()}`);
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        applications: data.items || [],
        pagination: { ...prev.pagination, totalCount: data.totalCount || 0 },
        loading: false
      }));
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to load applications',
        loading: false
      }));
      enqueueSnackbar('Failed to load applications', { variant: 'error' });
    }
  }, [api, enqueueSnackbar, state]);

  // Fetch GIS data
  useEffect(() => {
    const fetchGisData = async () => {
      try {
        const response = await api.get('/gis/available-parcels');
        setGisData(response.data);
      } catch (err) {
        console.error('Failed to fetch GIS data:', err);
      }
    };
    fetchGisData();
  }, [api]);

  const showApplicationLocation = (application) => {
    setSelectedApplicationLocation({
      coordinates: application.location?.coordinates || [],
      ward: application.preferredWard,
      village: application.preferredVillage
    });
  };

  const handleApplicationAction = async () => {
    const { selectedApplication, actionDialog } = state;
    if (!selectedApplication || !actionDialog.action) return;
    
    try {
      setState(prev => ({ ...prev, processing: true }));
      
      let endpoint = '';
      let payload = {};
      
      switch (actionDialog.action) {
        case 'approve':
          endpoint = `/applications/${selectedApplication.id}/approve`;
          payload = { notes: actionDialog.notes };
          break;
        case 'reject':
          endpoint = `/applications/${selectedApplication.id}/reject`;
          payload = { notes: actionDialog.notes };
          break;
        case 'request_info':
          endpoint = `/applications/${selectedApplication.id}/request-info`;
          payload = { notes: actionDialog.notes };
          break;
        default:
          throw new Error('Invalid action');
      }

      const response = await api.put(endpoint, payload);
      const data = await response.json();
      
      if (data.success) {
        enqueueSnackbar(`Application ${actionDialog.action === 'approve' ? 'approved' : 
          actionDialog.action === 'reject' ? 'rejected' : 'info requested'} successfully`, { 
          variant: 'success' 
        });
        fetchApplications();
      } else {
        throw new Error(data.message || 'Action failed');
      }
    } catch (err) {
      console.error('Action error:', err);
      enqueueSnackbar(err.message || 'Failed to process application', { variant: 'error' });
    } finally {
      setState(prev => ({
        ...prev,
        processing: false,
        actionDialog: { ...prev.actionDialog, open: false }
      }));
    }
  };

  // Event handlers
  const handleFilterChange = (name, value) => {
    setState(prev => ({
      ...prev,
      filterOptions: { ...prev.filterOptions, [name]: value }
    }));
  };

  const handleMenuOpen = (event, application) => {
    setState(prev => ({
      ...prev,
      menuAnchorEl: event.currentTarget,
      selectedApplication: application
    }));
  };

  const handleMenuClose = () => {
    setState(prev => ({ ...prev, menuAnchorEl: null }));
  };

  const openActionDialog = (action) => {
    setState(prev => ({
      ...prev,
      actionDialog: {
        open: true,
        action,
        notes: prev.selectedApplication?.notes || ''
      },
      menuAnchorEl: null
    }));
  };

  const openDetailDialog = (application) => {
    setState(prev => ({
      ...prev,
      selectedApplication: application,
      detailDialogOpen: true
    }));
    showApplicationLocation(application);
  };

  const handlePageChange = (event, page) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filterOptions: DEFAULT_FILTER_OPTIONS
    }));
  };

  // Effects
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications, state.pagination.page]);

  useEffect(() => {
    if (state.error) {
      enqueueSnackbar(state.error, { variant: 'error' });
    }
  }, [state.error, enqueueSnackbar]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filter Applications
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={state.filterOptions.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: state.filterOptions.searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange('searchQuery', '')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={state.filterOptions.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Plot Type</InputLabel>
              <Select
                value={state.filterOptions.plotType}
                label="Plot Type"
                onChange={(e) => handleFilterChange('plotType', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {PLOT_TYPE_OPTIONS.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ward</InputLabel>
              <Select
                value={state.filterOptions.ward}
                label="Ward"
                onChange={(e) => handleFilterChange('ward', e.target.value)}
              >
                <MenuItem value="">All Wards</MenuItem>
                {filterOptionsData.wards.map(ward => (
                  <MenuItem key={ward} value={ward}>{ward}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Village</InputLabel>
              <Select
                value={state.filterOptions.village}
                label="Village"
                onChange={(e) => handleFilterChange('village', e.target.value)}
              >
                <MenuItem value="">All Villages</MenuItem>
                {filterOptionsData.villages.map(village => (
                  <MenuItem key={village} value={village}>{village}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Start Date"
              value={state.filterOptions.startDate}
              onChange={(date) => handleFilterChange('startDate', date ? format(date, 'yyyy-MM-dd') : null)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="End Date"
              value={state.filterOptions.endDate}
              onChange={(date) => handleFilterChange('endDate', date ? format(date, 'yyyy-MM-dd') : null)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={state.filterOptions.priority}
                label="Priority"
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {PRIORITY_OPTIONS.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={fetchApplications}
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchApplications}
              sx={{ ml: 'auto' }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Land Allocation Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {state.applications.length} of {state.pagination.totalCount} applications
          </Typography>
        </Box>
        
        {state.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : state.error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load applications. <Button onClick={fetchApplications}>Retry</Button>
          </Alert>
        ) : state.applications.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No applications found matching your criteria
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Applicant</TableCell>
                    <TableCell>ID Number</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Preferred Location</TableCell>
                    <TableCell>Plot Type</TableCell>
                    <TableCell>Application Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.applications.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={app.applicantPhoto} sx={{ width: 32, height: 32 }}>
                            {app.applicantName?.charAt(0) || 'A'}
                          </Avatar>
                          {app.applicantName || 'Unknown'}
                        </Box>
                      </TableCell>
                      <TableCell>{app.idNumber || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">{app.email || '-'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{app.phone || '-'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2">{app.preferredLocation || '-'}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {app.preferredWard || 'Unknown'}, {app.preferredVillage || 'Unknown'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell><PlotTypeChip type={app.plotType} /></TableCell>
                      <TableCell>
                        {app.applicationDate ? format(new Date(app.applicationDate), 'PP') : '-'}
                      </TableCell>
                      <TableCell><StatusChip status={app.status} /></TableCell>
                      <TableCell>
                        <PriorityChip score={app.priorityScore} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => openDetailDialog(app)}
                            >
                              <DetailsIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, app)}
                            >
                              <MoreIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(state.pagination.totalCount / state.pagination.rowsPerPage)}
                page={state.pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={state.menuAnchorEl}
        open={Boolean(state.menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => openActionDialog('approve')} 
          disabled={state.selectedApplication?.status === 'approved'}
        >
          <ApproveIcon fontSize="small" sx={{ mr: 1 }} />
          Approve Application
        </MenuItem>
        <MenuItem 
          onClick={() => openActionDialog('reject')} 
          disabled={state.selectedApplication?.status === 'rejected'}
        >
          <RejectIcon fontSize="small" sx={{ mr: 1 }} />
          Reject Application
        </MenuItem>
        <MenuItem 
          onClick={() => openActionDialog('request_info')} 
          disabled={state.selectedApplication?.status === 'needs_info'}
        >
          <RequestInfoIcon fontSize="small" sx={{ mr: 1 }} />
          Request More Info
        </MenuItem>
      </Menu>

      {/* Action Dialog */}
      <Dialog
        open={state.actionDialog.open}
        onClose={() => setState(prev => ({
          ...prev,
          actionDialog: { ...prev.actionDialog, open: false }
        }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {state.actionDialog.action === 'approve' ? 'Approve Application' : 
           state.actionDialog.action === 'reject' ? 'Reject Application' : 'Request More Information'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {state.actionDialog.action === 'approve' ? 
              `You are about to approve the application from ${state.selectedApplication?.applicantName}. Please add any notes below:` :
             state.actionDialog.action === 'reject' ? 
              `You are about to reject the application from ${state.selectedApplication?.applicantName}. Please provide a reason:` :
              `Request more information from ${state.selectedApplication?.applicantName}. Please specify what you need:`}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={state.actionDialog.notes}
            onChange={(e) => setState(prev => ({
              ...prev,
              actionDialog: { ...prev.actionDialog, notes: e.target.value }
            }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState(prev => ({
            ...prev,
            actionDialog: { ...prev.actionDialog, open: false }
          }))}>
            Cancel
          </Button>
          <Button
            onClick={handleApplicationAction}
            color={
              state.actionDialog.action === 'approve' ? 'success' : 
              state.actionDialog.action === 'reject' ? 'error' : 'info'
            }
            variant="contained"
            disabled={state.processing}
            startIcon={state.processing ? <CircularProgress size={20} /> : null}
          >
            {state.processing ? 'Processing...' : 
             state.actionDialog.action === 'approve' ? 'Approve' : 
             state.actionDialog.action === 'reject' ? 'Reject' : 'Request Info'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog
        open={state.detailDialogOpen}
        onClose={() => setState(prev => ({ ...prev, detailDialogOpen: false }))}
        maxWidth="md"
        fullWidth
      >
        {state.selectedApplication && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={state.selectedApplication.applicantPhoto} sx={{ width: 40, height: 40 }}>
                  {state.selectedApplication.applicantName?.charAt(0) || 'A'}
                </Avatar>
                Application Details
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Applicant Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Full Name</Typography>
                    <Typography>{state.selectedApplication.applicantName || 'Unknown'}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">ID Number</Typography>
                    <Typography>{state.selectedApplication.idNumber || '-'}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Contact Information</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography>{state.selectedApplication.email || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography>{state.selectedApplication.phone || '-'}</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Plot Request Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Preferred Location</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography>{state.selectedApplication.preferredLocation || '-'}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {state.selectedApplication.preferredWard || 'Unknown'}, {state.selectedApplication.preferredVillage || 'Unknown'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Plot Type</Typography>
                    <PlotTypeChip type={state.selectedApplication.plotType} />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Application Date</Typography>
                    <Typography>
                      {state.selectedApplication.applicationDate ? 
                        format(new Date(state.selectedApplication.applicationDate), 'PPpp') : '-'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Status</Typography>
                    <StatusChip status={state.selectedApplication.status} />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Priority Score</Typography>
                    <PriorityChip score={state.selectedApplication.priorityScore} />
                  </Box>
                </Grid>
                
                {selectedApplicationLocation && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Location Preview
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ height: 300 }}>
                      <MapContainer 
                        center={selectedApplicationLocation.coordinates[0] || [-24.658, 25.908]} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; OpenStreetMap contributors'
                        />
                        {gisData && (
                          <GeoJSON 
                            data={gisData} 
                            style={{ color: 'green', fillOpacity: 0.2 }}
                          />
                        )}
                        {selectedApplicationLocation.coordinates.length > 0 && (
                          <GeoJSON 
                            data={{
                              type: 'Feature',
                              geometry: {
                                type: 'Point',
                                coordinates: selectedApplicationLocation.coordinates
                              }
                            }}
                            pointToLayer={(feature, latlng) => {
                              return L.circleMarker(latlng, {
                                radius: 8,
                                fillColor: 'red',
                                color: '#fff',
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8
                              });
                            }}
                          />
                        )}
                      </MapContainer>
                    </Box>
                  </Grid>
                )}
                
                {state.selectedApplication.notes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Notes
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography>{state.selectedApplication.notes}</Typography>
                  </Grid>
                )}
                
                {state.selectedApplication.documents?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Attached Documents
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {state.selectedApplication.documents.map((doc, index) => (
                        <Chip
                          key={index}
                          label={`Document ${index + 1}`}
                          onClick={() => window.open(doc, '_blank')}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setState(prev => ({ ...prev, detailDialogOpen: false }))}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AllocationQueue;