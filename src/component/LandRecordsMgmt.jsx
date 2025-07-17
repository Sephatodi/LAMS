/** @jsxRuntime classic */
/** @jsx React.createElement */


import {
    Add,
    CloudDownload,
    Delete,
    Edit,
    FilterList,
    GpsFixed,
    Layers,
    Map,
    Satellite,
    Search
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useEffect, useState } from 'react';
import { BotswanaRegions, LandStatuses, LandUseTypes } from './constants';

const LandRecordsMgmt = () => {
  const [records, setRecords] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({
    plotNumber: '',
    region: '',
    village: '',
    size: '',
    status: 'available',
    landUse: 'residential',
    coordinates: '',
    allocationDate: null,
    allocatedTo: ''
  });
  const [activeTab, setActiveTab] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    region: '',
    landUse: '',
    dateRange: [null, null]
  });

  useEffect(() => {
    // Simulate API fetch with Botswana-specific data
    const fetchRecords = async () => {
      try {
        // In a real app, this would be an API call
        const mockRecords = [
          {
            id: 'GAB-101',
            plotNumber: 'GAB-101',
            region: 'Gaborone',
            village: 'Mogoditshane',
            size: '500 sqm',
            status: 'allocated',
            landUse: 'residential',
            allocatedTo: 'Kgosietsile Molefe',
            allocationDate: '2023-05-15',
            coordinates: '-24.6279,25.9231',
            lastUpdated: '2023-06-10'
          },
          {
            id: 'FRN-205',
            plotNumber: 'FRN-205',
            region: 'Francistown',
            village: 'Tonota',
            size: '750 sqm',
            status: 'available',
            landUse: 'commercial',
            allocatedTo: null,
            allocationDate: null,
            coordinates: '-21.1739,27.5216',
            lastUpdated: '2023-05-22'
          },
          {
            id: 'MAU-312',
            plotNumber: 'MAU-312',
            region: 'Maun',
            village: 'Shorobe',
            size: '1200 sqm',
            status: 'reserved',
            landUse: 'tourism',
            allocatedTo: null,
            allocationDate: null,
            coordinates: '-19.9833,23.4167',
            lastUpdated: '2023-04-15'
          }
        ];
        
        setRecords(mockRecords);
      } catch (error) {
        console.error('Failed to fetch land records:', error);
      }
    };
    
    fetchRecords();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleSubmit = () => {
    if (currentRecord) {
      // Update existing record
      setRecords(records.map(record => 
        record.id === currentRecord.id ? { ...record, ...formData } : record
      ));
    } else {
      // Add new record
      const newRecord = {
        id: `${formData.region.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
        allocatedTo: formData.status === 'allocated' ? formData.allocatedTo || 'Pending Assignment' : null,
        allocationDate: formData.status === 'allocated' ? 
          (formData.allocationDate || new Date()).toISOString().split('T')[0] : null,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setRecords([...records, newRecord]);
    }
    setOpenDialog(false);
  };

  const handleDelete = (id) => {
    setRecords(records.filter(record => record.id !== id));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.allocatedTo && record.allocatedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilters = 
      (filters.status === '' || record.status === filters.status) &&
      (filters.region === '' || record.region === filters.region) &&
      (filters.landUse === '' || record.landUse === filters.landUse) &&
      (!filters.dateRange[0] || record.lastUpdated >= filters.dateRange[0].toISOString().split('T')[0]) &&
      (!filters.dateRange[1] || record.lastUpdated <= filters.dateRange[1].toISOString().split('T')[0]);
    
    return matchesSearch && matchesFilters;
  });

 const exportToCSV = () => {
  const csvContent = [
    'Land ID,Owner,Location,Status', // CSV header
    ...records.map(record => 
      `${record.id},${record.owner},${record.location},${record.status}`
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'land_records.csv';
  link.click();
  URL.revokeObjectURL(url);
   };

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
        <Map sx={{ mr: 1, verticalAlign: 'middle' }} />
        Botswana Tribal Land Records Management
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search land records"
              InputProps={{ startAdornment: <Search /> }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => {
                setCurrentRecord(null);
                setFormData({
                  plotNumber: '',
                  region: '',
                  village: '',
                  size: '',
                  status: 'available',
                  landUse: 'residential',
                  coordinates: '',
                  allocationDate: null,
                  allocatedTo: ''
                });
                setOpenDialog(true);
              }}
              fullWidth
            >
              Add Record
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterOpen(true)}
              fullWidth
            >
              Filters
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={exportToCSV}
              fullWidth
            >
              Export
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant={activeTab === 'table' ? 'contained' : 'outlined'}
              startIcon={activeTab === 'table' ? <Layers /> : <Satellite />}
              onClick={() => setActiveTab(activeTab === 'table' ? 'map' : 'table')}
              fullWidth
            >
              {activeTab === 'table' ? 'Map View' : 'Table View'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {activeTab === 'map' ? (
        <Paper sx={{ p: 2, height: '600px', position: 'relative' }}>
          <Box sx={{ 
            bgcolor: '#E8F5E9', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 1
          }}>
            <Satellite sx={{ fontSize: 60, color: '#81C784', mr: 2 }} />
            <Typography variant="h5" color="textSecondary">
              Interactive GIS Map (Would display actual land parcels)
            </Typography>
          </Box>
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Button variant="contained" startIcon={<GpsFixed />}>
              View Selected
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Land Parcel Records
            </Typography>
            <Chip 
              label={`${filteredRecords.length} records`} 
              color="primary" 
              variant="outlined"
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#E8F5E9' }}>
                <TableRow>
                  <TableCell>Plot Number</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>Village</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Land Use</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Allocated To</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                          bgcolor: record.status === 'allocated' ? '#4caf50' : 
                                   record.status === 'available' ? '#2196f3' : '#9c27b0',
                          width: 24, 
                          height: 24,
                          mr: 1
                        }}>
                          {record.plotNumber.substring(0, 1)}
                        </Avatar>
                        {record.plotNumber}
                      </Box>
                    </TableCell>
                    <TableCell>{record.region}</TableCell>
                    <TableCell>{record.village}</TableCell>
                    <TableCell>{record.size}</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.landUse} 
                        size="small"
                        sx={{ 
                          bgcolor: '#e3f2fd',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.status} 
                        color={
                          record.status === 'allocated' ? 'success' : 
                          record.status === 'available' ? 'primary' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {record.allocatedTo || (
                        <Typography color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.lastUpdated}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => {
                          setCurrentRecord(record);
                          setFormData({
                            plotNumber: record.plotNumber,
                            region: record.region,
                            village: record.village,
                            size: record.size,
                            status: record.status,
                            landUse: record.landUse,
                            coordinates: record.coordinates,
                            allocatedTo: record.allocatedTo || '',
                            allocationDate: record.allocationDate ? new Date(record.allocationDate) : null
                          });
                          setOpenDialog(true);
                        }}>
                          <Edit color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(record.id)}>
                          <Delete color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Land Records</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {LandStatuses.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  name="region"
                  value={filters.region}
                  onChange={handleFilterChange}
                  label="Region"
                >
                  <MenuItem value="">All Regions</MenuItem>
                  {BotswanaRegions.map(region => (
                    <MenuItem key={region} value={region}>{region}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Land Use</InputLabel>
                <Select
                  name="landUse"
                  value={filters.landUse}
                  onChange={handleFilterChange}
                  label="Land Use"
                >
                  <MenuItem value="">All Land Uses</MenuItem>
                  {LandUseTypes.map(use => (
                    <MenuItem key={use} value={use}>
                      {use.charAt(0).toUpperCase() + use.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={filters.dateRange[0]}
                  onChange={(date) => setFilters(prev => ({
                    ...prev,
                    dateRange: [date, prev.dateRange[1]]
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={filters.dateRange[1]}
                  onChange={(date) => setFilters(prev => ({
                    ...prev,
                    dateRange: [prev.dateRange[0], date]
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFilters({
              status: '',
              region: '',
              landUse: '',
              dateRange: [null, null]
            });
          }}>
            Clear All
          </Button>
          <Button onClick={() => setFilterOpen(false)} color="primary">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {currentRecord ? 'Edit Land Record' : 'Add New Land Record'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Plot Number"
                name="plotNumber"
                value={formData.plotNumber}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                >
                  {BotswanaRegions.map(region => (
                    <MenuItem key={region} value={region}>{region}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Village"
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Size (sqm)"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Land Use</InputLabel>
                <Select
                  name="landUse"
                  value={formData.landUse}
                  onChange={handleInputChange}
                  required
                >
                  {LandUseTypes.map(use => (
                    <MenuItem key={use} value={use}>
                      {use.charAt(0).toUpperCase() + use.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  {LandStatuses.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {formData.status === 'allocated' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Allocated To"
                    name="allocatedTo"
                    value={formData.allocatedTo}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Allocation Date"
                      value={formData.allocationDate}
                      onChange={(date) => handleDateChange(date, 'allocationDate')}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Coordinates (lat,long)"
                name="coordinates"
                value={formData.coordinates}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <IconButton>
                      <GpsFixed />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LandRecordsMgmt;