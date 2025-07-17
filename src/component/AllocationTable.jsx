
/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    CheckCircle as ApproveIcon,
    Description as CertificateIcon,
    Warning as ConflictIcon,
    GridOn as ExcelIcon,
    FilterList as FilterIcon,
    MoreVert as MoreIcon,
    PictureAsPdf as PdfIcon,
    Refresh as RefreshIcon,
    Block as RevokeIcon,
    Search as SearchIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    Menu,
    MenuItem,
    Paper,
    Select,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadExcel, downloadPdf } from '../utils/exportUtils';
import ConflictDetectionMap from './maps/ConflictDetectionMap';

const AllocationTable = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  // Sample data - replace with API call in production
  const [allocations, setAllocations] = useState([
    {
      id: 'AL-1001',
      applicant: { name: 'John Doe', id: 'AP-2001' },
      plot: { id: 'P001', number: 'PL-001', size: '500 sqm', type: 'Residential', ward: 'Ward 1', village: 'Gaborone Village' },
      allocationDate: '2023-05-15',
      status: 'Approved',
      paymentStatus: 'Paid',
      lastUpdated: '2023-05-16T10:30:00Z'
    },
    {
      id: 'AL-1002',
      applicant: { name: 'Jane Smith', id: 'AP-2002' },
      plot: { id: 'P002', number: 'PL-002', size: '1000 sqm', type: 'Commercial', ward: 'Ward 2', village: 'Molepolole Village' },
      allocationDate: '2023-06-20',
      status: 'Pending Approval',
      paymentStatus: 'Pending',
      lastUpdated: '2023-06-20T14:45:00Z'
    },
    {
      id: 'AL-1003',
      applicant: { name: 'Michael Brown', id: 'AP-2003' },
      plot: { id: 'P003', number: 'PL-003', size: '750 sqm', type: 'Agricultural', ward: 'Ward 3', village: 'Francistown Village' },
      allocationDate: '2023-04-10',
      status: 'Revoked',
      paymentStatus: 'Refunded',
      lastUpdated: '2023-07-01T09:15:00Z'
    },
    {
      id: 'AL-1004',
      applicant: { name: 'Sarah Johnson', id: 'AP-2004' },
      plot: { id: 'P004', number: 'PL-004', size: '600 sqm', type: 'Residential', ward: 'Ward 1', village: 'Gaborone Village' },
      allocationDate: '2023-07-05',
      status: 'Approved',
      paymentStatus: 'Paid',
      lastUpdated: '2023-07-06T11:20:00Z'
    }
  ]);

  // State for table controls
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('plot.number');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');
  const [villageFilter, setVillageFilter] = useState('All');
  const [plotTypeFilter, setPlotTypeFilter] = useState('All');
  const [dateRange, setDateRange] = useState([null, null]);

  // Menu controls
  const [anchorEl, setAnchorEl] = useState(null);
  const [rowMenuAnchor, setRowMenuAnchor] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  // Conflict detection state
  const [showConflictMap, setShowConflictMap] = useState(false);
  const [conflictData, setConflictData] = useState(null);

  // New state for conflict detection
  const [newAllocationDialogOpen, setNewAllocationDialogOpen] = useState(false);
  const [newAllocationData, setNewAllocationData] = useState(null);
  const [conflictCheckInProgress, setConflictCheckInProgress] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);

  // Enhanced checkConflicts function
  const checkConflicts = async (allocationIdOrData) => {
    try {
      setConflictCheckInProgress(true);
      setHasConflicts(false);
      
      // Determine if we're checking an existing allocation or a new one
      const isNewAllocation = typeof allocationIdOrData !== 'string';
      const allocationData = isNewAllocation 
        ? allocationIdOrData 
        : allocations.find(a => a.id === allocationIdOrData);

      // Mock API call - in a real app this would be an actual API request
      const mockResponse = {
        hasConflicts: allocations.some(a => 
          a.id !== allocationData.id && 
          a.plot.number === allocationData.plot.number
        ),
        conflicts: allocations.filter(a => 
          a.id !== allocationData.id && 
          a.plot.number === allocationData.plot.number
        )
      };

      if (mockResponse.hasConflicts) {
        setHasConflicts(true);
        setConflictData({
          allocation: allocationData,
          conflicts: mockResponse.conflicts
        });
        if (isNewAllocation) {
          setNewAllocationData(allocationData);
        }
      }

      setConflictCheckInProgress(false);
      setShowConflictMap(mockResponse.hasConflicts);
      if (!isNewAllocation) {
        handleRowMenuClose();
      }
      
      return mockResponse.hasConflicts;
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to check for conflicts', { variant: 'error' });
      setConflictCheckInProgress(false);
      return false;
    }
  };

  // New function to handle new allocation with conflict check
  const handleNewAllocation = async (allocationData) => {
    const hasConflicts = await checkConflicts(allocationData);
    if (!hasConflicts) {
      // Proceed with allocation creation
      createAllocation(allocationData);
    }
  };

  const createAllocation = async (allocationData) => {
    try {
      setLoading(true);
      // const response = await api.post('/allocations', allocationData);
      // Mock response for demo
      const newAllocation = {
        ...allocationData,
        id: `AL-${1000 + allocations.length + 1}`,
        status: 'Pending Approval',
        paymentStatus: 'Pending',
        lastUpdated: new Date().toISOString()
      };
      setAllocations([...allocations, newAllocation]);
      enqueueSnackbar('Allocation created successfully', { variant: 'success' });
      setNewAllocationDialogOpen(false);
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to create allocation', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Add conflict indicator to table rows
  const getConflictStatus = (allocation) => {
    const hasConflict = allocations.some(a => 
      a.id !== allocation.id && 
      a.plot.number === allocation.plot.number
    );
    return hasConflict ? 'High Risk' : 'No Conflicts';
  };

  // Fetch data from API
  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        setLoading(true);
        setError(null);
        // const response = await fetch('/api/allocations');
        // const data = await response.json();
        // setAllocations(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        enqueueSnackbar('Failed to fetch allocation data', { variant: 'error' });
        setLoading(false);
      }
    };

    fetchAllocations();
  }, [enqueueSnackbar]);

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle row selection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredAllocations.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRowMenuOpen = (event, row) => {
    setRowMenuAnchor(event.currentTarget);
    setCurrentRow(row);
  };

  const handleRowMenuClose = () => {
    setRowMenuAnchor(null);
    setCurrentRow(null);
  };

  // Handle actions
  const handleViewDetails = (id) => {
    navigate(`/allocations/${id}`);
    handleRowMenuClose();
  };

  const handleGenerateCertificate = (id) => {
    enqueueSnackbar(`Generating certificate for allocation ${id}`, { variant: 'info' });
    handleRowMenuClose();
  };

  const handleRevokeAllocation = (id) => {
    enqueueSnackbar(`Revoking allocation ${id}`, { variant: 'warning' });
    handleRowMenuClose();
  };

  const handleApproveAllocation = (id) => {
    enqueueSnackbar(`Approving allocation ${id}`, { variant: 'success' });
    handleRowMenuClose();
  };

  const handleBulkApprove = () => {
    enqueueSnackbar(`Approving ${selected.length} allocations`, { variant: 'success' });
    setSelected([]);
    handleMenuClose();
  };

  const handleBulkRevoke = () => {
    enqueueSnackbar(`Revoking ${selected.length} allocations`, { variant: 'warning' });
    setSelected([]);
    handleMenuClose();
  };

  const handleExportExcel = () => {
    downloadExcel(filteredAllocations, 'allocations');
    handleMenuClose();
  };

  const handleExportPdf = () => {
    downloadPdf(filteredAllocations, 'allocations');
    handleMenuClose();
  };

  const handleRefresh = () => {
    enqueueSnackbar('Refreshing data...', { variant: 'info' });
    // Add actual refresh logic
  };

  // Filter and sort data
  const filteredAllocations = useMemo(() => {
    return allocations.filter((allocation) => {
      const matchesSearch = 
        allocation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.plot.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.plot.village.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || allocation.status === statusFilter;
      const matchesWard = wardFilter === 'All' || allocation.plot.ward === wardFilter;
      const matchesVillage = villageFilter === 'All' || allocation.plot.village === villageFilter;
      const matchesPlotType = plotTypeFilter === 'All' || allocation.plot.type === plotTypeFilter;
      
      const matchesDateRange = 
        (!dateRange[0] || new Date(allocation.allocationDate) >= new Date(dateRange[0])) &&
        (!dateRange[1] || new Date(allocation.allocationDate) <= new Date(dateRange[1]));

      return matchesSearch && matchesStatus && matchesWard && matchesVillage && 
             matchesPlotType && matchesDateRange;
    }).sort((a, b) => {
      let comparison = 0;
      const aValue = orderBy.includes('.') ? 
        orderBy.split('.').reduce((o, i) => o[i], a) : 
        a[orderBy];
      const bValue = orderBy.includes('.') ? 
        orderBy.split('.').reduce((o, i) => o[i], b) : 
        b[orderBy];

      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }
      return order === 'desc' ? comparison * -1 : comparison;
    });
  }, [allocations, searchTerm, statusFilter, wardFilter, villageFilter, plotTypeFilter, dateRange, order, orderBy]);

  // Get unique values for filters
  const statusOptions = useMemo(() => {
    const options = new Set(allocations.map(a => a.status));
    return ['All', ...Array.from(options)];
  }, [allocations]);

  const wardOptions = useMemo(() => {
    const options = new Set(allocations.map(a => a.plot.ward));
    return ['All', ...Array.from(options)];
  }, [allocations]);

  const villageOptions = useMemo(() => {
    const options = new Set(allocations.map(a => a.plot.village));
    return ['All', ...Array.from(options)];
  }, [allocations]);

  const plotTypeOptions = useMemo(() => {
    const options = new Set(allocations.map(a => a.plot.type));
    return ['All', ...Array.from(options)];
  }, [allocations]);

  // Pagination
  const paginatedAllocations = useMemo(() => {
    return filteredAllocations.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredAllocations, page, rowsPerPage]);

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Add to the table columns
  const columns = [
    {
      field: 'id',
      headerName: 'Allocation ID',
      sortable: true
    },
    {
      field: 'applicant.name',
      headerName: 'Applicant',
      sortable: true
    },
    {
      field: 'plot.number',
      headerName: 'Plot Number',
      sortable: true
    },
    {
      field: 'plot.type',
      headerName: 'Plot Type',
      sortable: true
    },
    {
      field: 'plot.size',
      headerName: 'Size',
      sortable: true
    },
    {
      field: 'plot.ward',
      headerName: 'Ward',
      sortable: true
    },
    {
      field: 'plot.village',
      headerName: 'Village',
      sortable: true
    },
    {
      field: 'allocationDate',
      headerName: 'Allocation Date',
      sortable: true
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment Status',
      sortable: true
    },
    {
      field: 'conflictStatus',
      headerName: 'Conflict Status',
      renderCell: (params) => (
        <Chip
          label={getConflictStatus(params.row)}
          color={getConflictStatus(params.row) === 'High Risk' ? 'error' : 'success'}
          size="small"
        />
      )
    }
  ];

  // Add to the action buttons
  const actionButtons = [
    <Button
      variant="contained"
      color="primary"
      onClick={() => setNewAllocationDialogOpen(true)}
    >
      New Allocation
    </Button>
  ];

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search allocations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Ward</InputLabel>
              <Select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                label="Ward"
              >
                {wardOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Village</InputLabel>
              <Select
                value={villageFilter}
                onChange={(e) => setVillageFilter(e.target.value)}
                label="Village"
              >
                {villageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Plot Type</InputLabel>
              <Select
                value={plotTypeFilter}
                onChange={(e) => setPlotTypeFilter(e.target.value)}
                label="Plot Type"
              >
                {plotTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From Date"
                value={dateRange[0]}
                onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="To Date"
                value={dateRange[1]}
                onChange={(newValue) => setDateRange([dateRange[0], newValue])}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={() => {
                // Reset all filters
                setStatusFilter('All');
                setWardFilter('All');
                setVillageFilter('All');
                setPlotTypeFilter('All');
                setDateRange([null, null]);
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
            
            {actionButtons}
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<MoreIcon />}
              onClick={handleMenuOpen}
              disabled={selected.length === 0}
            >
              Actions
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleBulkApprove} disabled={selected.length === 0}>
                <ApproveIcon sx={{ mr: 1 }} /> Approve Selected
              </MenuItem>
              <MenuItem onClick={handleBulkRevoke} disabled={selected.length === 0}>
                <RevokeIcon sx={{ mr: 1 }} /> Revoke Selected
              </MenuItem>
              <MenuItem onClick={handleExportExcel}>
                <ExcelIcon sx={{ mr: 1 }} /> Export to Excel
              </MenuItem>
              <MenuItem onClick={handleExportPdf}>
                <PdfIcon sx={{ mr: 1 }} /> Export to PDF
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Box>
      
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table
          stickyHeader
          aria-labelledby="allocationTable"
          size={dense ? 'small' : 'medium'}
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < filteredAllocations.length}
                  checked={filteredAllocations.length > 0 && selected.length === filteredAllocations.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column.field}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.field}
                      direction={orderBy === column.field ? order : 'asc'}
                      onClick={() => handleRequestSort(column.field)}
                    >
                      {column.headerName}
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} align="center">
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            ) : paginatedAllocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} align="center">
                  <Typography>No allocations found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAllocations.map((row) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow
                    hover
                    key={row.id}
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">{row.applicant.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {row.applicant.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.plot.number}</TableCell>
                    <TableCell>{row.plot.type}</TableCell>
                    <TableCell>{row.plot.size}</TableCell>
                    <TableCell>{row.plot.ward}</TableCell>
                    <TableCell>{row.plot.village}</TableCell>
                    <TableCell>
                      {new Date(row.allocationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        color={
                          row.status === 'Approved' ? 'success' :
                          row.status === 'Pending Approval' ? 'warning' :
                          row.status === 'Revoked' ? 'error' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.paymentStatus}
                        color={
                          row.paymentStatus === 'Paid' ? 'success' :
                          row.paymentStatus === 'Pending' ? 'warning' :
                          row.paymentStatus === 'Refunded' ? 'info' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {columns.find(c => c.field === 'conflictStatus')?.renderCell({ row })}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleRowMenuOpen(e, row)}>
                        <MoreIcon />
                      </IconButton>
                      <Menu
                        anchorEl={rowMenuAnchor}
                        open={Boolean(rowMenuAnchor && currentRow?.id === row.id)}
                        onClose={handleRowMenuClose}
                      >
                        <MenuItem onClick={() => handleViewDetails(row.id)}>
                          <ViewIcon sx={{ mr: 1 }} /> View Details
                        </MenuItem>
                        <MenuItem 
                          onClick={() => handleGenerateCertificate(row.id)}
                          disabled={row.status !== 'Approved'}
                        >
                          <CertificateIcon sx={{ mr: 1 }} /> Generate Certificate
                        </MenuItem>
                        <MenuItem 
                          onClick={() => handleApproveAllocation(row.id)}
                          disabled={row.status === 'Approved'}
                        >
                          <ApproveIcon sx={{ mr: 1 }} /> Approve
                        </MenuItem>
                        <MenuItem 
                          onClick={() => handleRevokeAllocation(row.id)}
                          disabled={row.status === 'Revoked'}
                        >
                          <RevokeIcon sx={{ mr: 1 }} /> Revoke
                        </MenuItem>
                        <MenuItem onClick={() => checkConflicts(row.id)}>
                          <ConflictIcon sx={{ mr: 1 }} /> Check Conflicts
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={dense}
              onChange={(event) => setDense(event.target.checked)}
            />
          }
          label="Compact view"
        />
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAllocations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      {/* Enhanced conflict detection dialog */}
      <Dialog 
        open={showConflictMap} 
        onClose={() => setShowConflictMap(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {newAllocationData ? 'Potential Allocation Conflict' : 'Conflict Detection'}
        </DialogTitle>
        <DialogContent sx={{ height: '70vh' }}>
          <ConflictDetectionMap 
            allocationData={conflictData}
            onConflictResolved={() => {
              setHasConflicts(false);
              if (newAllocationData) {
                createAllocation(newAllocationData);
              }
            }}
          />
        </DialogContent>
        {newAllocationData && (
          <DialogActions>
            <Button onClick={() => setShowConflictMap(false)}>
              Cancel Allocation
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                setShowConflictMap(false);
                createAllocation(newAllocationData);
              }}
              disabled={hasConflicts}
            >
              Proceed Anyway
            </Button>
          </DialogActions>
        )}
      </Dialog>
      
      {/* New Allocation Dialog */}
      <Dialog
        open={newAllocationDialogOpen}
        onClose={() => setNewAllocationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Allocation</DialogTitle>
        <DialogContent>
          {/* Form for new allocation would go here */}
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => handleNewAllocation({
              applicant: { name: 'New Applicant', id: 'AP-9999' },
              plot: { 
                id: 'P999', 
                number: 'PL-999', 
                size: '1000 sqm', 
                type: 'Residential',
                ward: 'Ward 1',
                village: 'Gaborone Village'
              },
              allocationDate: new Date().toISOString().split('T')[0]
            })}
            disabled={conflictCheckInProgress}
          >
            {conflictCheckInProgress ? (
              <>
                <CircularProgress size={24} />
                Checking for conflicts...
              </>
            ) : 'Submit Allocation'}
          </Button>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default AllocationTable;