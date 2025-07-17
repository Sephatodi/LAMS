/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    Clear as ClearIcon,
    FilterList as FilterIcon,
    MoreVert as MoreIcon,
    PictureAsPdf as PdfIcon,
    Refresh as RefreshIcon,
    Cancel as RevokeIcon,
    Search as SearchIcon,
    ArrowUpward as SortAscIcon,
    ArrowDownward as SortDescIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {
    Alert,
    Badge,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
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
import { useSnackbar } from 'notistack';
import  React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';

const AllocationPlots = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const api = useApi(); // Assuming useApi is a custom hook
  
  // State declarations with initial values
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    ward: '',
    village: '',
    plotType: '',
    status: '',
    startDate: null,
    endDate: null,
    searchQuery: ''
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    rowsPerPage: 10,
    totalCount: 0
  });

  /**
   * Fetches allocations from the API with current filters and pagination
   * @returns {Promise<void>}
   */
  const fetchAllocations = async () => {
    try {
      setLoading(true);
      setError(false);
      
      const params = new URLSearchParams();
      
      // Add filter options to params if they exist
      Object.entries(filterOptions).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      // Add pagination and sorting
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.rowsPerPage.toString());
      
      if (sortConfig) {
        params.append('sortBy', sortConfig.key);
        params.append('sortOrder', sortConfig.direction);
      }

      const response = await api.get(`/allocations?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch allocations');
      
      setAllocations(data.items || []);
      setPagination(prev => ({
        ...prev,
        totalCount: data.totalCount || 0
      }));
    } catch (err) {
      console.error('Failed to fetch allocations:', err);
      setError(true);
      enqueueSnackbar(err.message || 'Failed to load allocation data', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles revoking an allocation
   * @returns {Promise<void>}
   */
  const handleRevokeAllocation = async () => {
    if (!selectedAllocation) return;
    
    try {
      setRevoking(true);
      const response = await api.delete(`/allocations/${selectedAllocation.id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to revoke allocation');
      
      enqueueSnackbar('Allocation revoked successfully', { 
        variant: 'success',
        autoHideDuration: 3000
      });
      await fetchAllocations();
    } catch (err) {
      console.error('Revocation error:', err);
      enqueueSnackbar(err.message || 'Failed to revoke allocation', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    } finally {
      setRevoking(false);
      setRevokeDialogOpen(false);
    }
  };

  /**
   * Handles sorting requests
   * @param {string} key - The field to sort by
   */
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /**
   * Opens the action menu for an allocation
   * @param {Event} event - The click event
   * @param {Object} allocation - The allocation to set as selected
   */
  const handleMenuOpen = (event, allocation) => {
    setAnchorEl(event.currentTarget);
    setSelectedAllocation(allocation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Returns a styled status chip component
   * @param {string} status - The status value
   * @returns {JSX.Element}
   */
  const getStatusChip = (status) => {
    const statusMap = {
      approved: { color: 'success', label: 'Approved' },
      pending: { color: 'warning', label: 'Pending' },
      revoked: { color: 'error', label: 'Revoked' },
      disputed: { color: 'info', label: 'Disputed' }
    };
    
    const config = statusMap[status] || { color: 'default', label: status };
    
    return (
      <Chip 
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  /**
   * Returns a styled plot type chip component
   * @param {string} type - The plot type value
   * @returns {JSX.Element}
   */
  const getPlotTypeChip = (type) => {
    const typeMap = {
      residential: { color: 'primary', label: 'Residential' },
      commercial: { color: 'secondary', label: 'Commercial' },
      agricultural: { color: 'success', label: 'Agricultural' },
      industrial: { color: 'info', label: 'Industrial' }
    };
    
    const config = typeMap[type] || { color: 'default', label: type };
    
    return (
      <Chip 
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  /**
   * Clears all filter options
   */
  const clearFilters = () => {
    setFilterOptions({
      ward: '',
      village: '',
      plotType: '',
      status: '',
      startDate: null,
      endDate: null,
      searchQuery: ''
    });
  };

  /**
   * Memoized filter options derived from the allocations data
   */
  const filterOptionsData = useMemo(() => {
    const wards = new Set();
    const villages = new Set();
    const plotTypes = new Set();
    const statuses = new Set();

    allocations.forEach(allocation => {
      if (allocation.ward) wards.add(allocation.ward);
      if (allocation.village) villages.add(allocation.village);
      if (allocation.plotType) plotTypes.add(allocation.plotType);
      if (allocation.status) statuses.add(allocation.status);
    });

    return {
      wards: Array.from(wards).sort(),
      villages: Array.from(villages).sort(),
      plotTypes: Array.from(plotTypes).sort(),
      statuses: Array.from(statuses).sort()
    };
  }, [allocations]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchAllocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOptions, sortConfig, pagination.page, pagination.rowsPerPage]);

  // Error boundary fallback
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load allocation data. <Button onClick={fetchAllocations}>Retry</Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Filters Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filter Allocations
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={filterOptions.searchQuery}
              onChange={(e) => setFilterOptions(prev => ({
                ...prev,
                searchQuery: e.target.value
              }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filterOptions.searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => setFilterOptions(prev => ({
                      ...prev,
                      searchQuery: ''
                    }))}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )
              }}
            />
          </Grid>
          
          {/* Filter dropdowns */}
          {['ward', 'village', 'plotType', 'status'].map((filter) => (
            <Grid item xs={12} sm={6} md={2} key={filter}>
              <FormControl fullWidth>
                <InputLabel>{filter.charAt(0).toUpperCase() + filter.slice(1)}</InputLabel>
                <Select
                  value={filterOptions[filter]}
                  label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                  onChange={(e) => setFilterOptions(prev => ({
                    ...prev,
                    [filter]: e.target.value
                  }))}
                >
                  <MenuItem value="">All Statuses{filter.charAt(0).toUpperCase() + filter.slice(1)}</MenuItem>
                  {filterOptionsData[`${filter}s`]?.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
          
          {/* Date pickers */}
          {['startDate', 'endDate'].map((dateType) => (
            <Grid item xs={12} sm={6} md={3} key={dateType}>
              <DatePicker
                label={dateType === 'startDate' ? 'Start Date' : 'End Date'}
                value={filterOptions[dateType]}
                onChange={(date) => setFilterOptions(prev => ({
                  ...prev,
                  [dateType]: date ? format(date, 'yyyy-MM-dd') : null
                }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          ))}
          
          {/* Action buttons */}
          <Grid item xs={12} sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={fetchAllocations}
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
              onClick={fetchAllocations}
              sx={{ ml: 'auto' }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Allocated Plots
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {allocations.length} of {pagination.totalCount} records
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : allocations.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No allocations found matching your criteria
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {[
                      { key: 'plotNumber', label: 'Plot Number' },
                      { key: 'applicantName', label: 'Applicant' },
                      { key: null, label: 'Ward/Village' },
                      { key: null, label: 'Plot Type' },
                      { key: 'allocationDate', label: 'Allocation Date' },
                      { key: null, label: 'Status' },
                      { key: null, label: 'Actions' }
                    ].map((header) => (
                      <TableCell key={header.label}>
                        {header.key ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {header.label}
                            <IconButton 
                              size="small" 
                              onClick={() => requestSort(header.key)}
                            >
                              {sortConfig?.key === header.key ? (
                                sortConfig.direction === 'asc' ? 
                                  <SortAscIcon fontSize="small" /> : 
                                  <SortDescIcon fontSize="small" />
                              ) : <FilterIcon fontSize="small" />}
                            </IconButton>
                          </Box>
                        ) : header.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allocations.map((allocation) => (
                    <TableRow key={allocation.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{allocation.plotNumber}</Typography>
                      </TableCell>
                      <TableCell>{allocation.applicantName}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{allocation.ward}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {allocation.village}
                        </Typography>
                      </TableCell>
                      <TableCell>{getPlotTypeChip(allocation.plotType)}</TableCell>
                      <TableCell>
                        {allocation.allocationDate && format(new Date(allocation.allocationDate), 'PP')}
                      </TableCell>
                      <TableCell>{getStatusChip(allocation.status)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/allocations/${allocation.id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Generate Certificate">
                            <span>
                              <IconButton
                                size="small"
                                disabled={allocation.status !== 'approved' || allocation.certificateGenerated}
                                onClick={() => navigate(`/allocations/${allocation.id}/certificate`)}
                              >
                                <Badge
                                  color="error"
                                  variant="dot"
                                  invisible={!allocation.certificateGenerated}
                                >
                                  <PdfIcon fontSize="small" />
                                </Badge>
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, allocation)}
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
            {pagination.totalCount > pagination.rowsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={Math.ceil(pagination.totalCount / pagination.rowsPerPage)}
                  page={pagination.page}
                  onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          if (selectedAllocation) navigate(`/allocations/${selectedAllocation.id}`);
          handleMenuClose();
        }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (selectedAllocation) navigate(`/allocations/${selectedAllocation.id}/certificate`);
            handleMenuClose();
          }}
          disabled={!selectedAllocation || selectedAllocation.status !== 'approved'}
        >
          <PdfIcon fontSize="small" sx={{ mr: 1 }} />
          Generate Certificate
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setRevokeDialogOpen(true);
            handleMenuClose();
          }}
          disabled={!selectedAllocation || selectedAllocation.status === 'revoked'}
        >
          <RevokeIcon fontSize="small" sx={{ mr: 1 }} />
          Revoke Allocation
        </MenuItem>
      </Menu>

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={revokeDialogOpen}
        onClose={() => setRevokeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Revoke Allocation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to revoke the allocation of plot {selectedAllocation?.plotNumber} to {selectedAllocation?.applicantName}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRevokeAllocation}
            color="error"
            variant="contained"
            disabled={revoking}
            startIcon={revoking ? <CircularProgress size={20} /> : <RevokeIcon />}
          >
            {revoking ? 'Revoking...' : 'Revoke Allocation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllocationPlots;