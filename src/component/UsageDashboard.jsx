/** @jsxRuntime classic */
/** @jsx React.createElement */

import esriConfig from '@arcgis/core/config';
import BarChartIcon from '@mui/icons-material/BarChart';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PieChartIcon from '@mui/icons-material/PieChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Tab,
    Tabs,
    Tooltip,
    Typography
} from '@mui/material';
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarFilterButton
} from '@mui/x-data-grid';
import  React, { useEffect, useState } from 'react';

// Custom toolbar with additional controls
function CustomToolbar({ onRefresh, onDateRangeClick }) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Tooltip title="Refresh Data">
        <IconButton onClick={onRefresh}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Select Date Range">
        <IconButton onClick={onDateRangeClick}>
          <DateRangeIcon />
        </IconButton>
      </Tooltip>
    </GridToolbarContainer>
  );
}

export const UsageDashboard = () => {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('table');
  const [dateRange, setDateRange] = useState('last7days');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Enable usage tracking
  useEffect(() => {
    esriConfig.usage = {
      enabled: true,
      username: "land_management_system"
    };
  }, []);

  // Fetch usage data
  const fetchUsageData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - in a real app, this would come from your API
      const mockData = [
        { id: '1', date: '2023-06-01', user: 'admin', action: 'view', layer: 'Parcels', duration: 120, status: 'success', cost: 45.50, budgetCode: 'GIS-2023' },
        { id: '2', date: '2023-06-01', user: 'surveyor', action: 'edit', layer: 'Parcels', duration: 45, status: 'success', cost: 32.75, budgetCode: 'SURVEY-2023' },
        { id: '3', date: '2023-06-02', user: 'clerk', action: 'query', layer: 'Zoning', duration: 30, status: 'success', cost: 18.20, budgetCode: 'ADMIN-2023' },
        { id: '4', date: '2023-06-02', user: 'admin', action: 'print', layer: 'Basemap', duration: 15, status: 'success', cost: 25.00, budgetCode: 'GIS-2023' },
        { id: '5', date: '2023-06-03', user: 'surveyor', action: 'edit', layer: 'Parcels', duration: 90, status: 'success', cost: 67.80, budgetCode: 'SURVEY-2023' },
        { id: '6', date: '2023-06-03', user: 'admin', action: 'export', layer: 'All Layers', duration: 60, status: 'success', cost: 55.25, budgetCode: 'GIS-2023' },
        { id: '7', date: '2023-06-04', user: 'clerk', action: 'view', layer: 'Ownership', duration: 25, status: 'success', cost: 12.50, budgetCode: 'ADMIN-2023' },
        { id: '8', date: '2023-06-04', user: 'surveyor', action: 'measure', layer: 'Parcels', duration: 75, status: 'success', cost: 42.30, budgetCode: 'SURVEY-2023' },
        { id: '9', date: '2023-06-05', user: 'admin', action: 'print', layer: 'Zoning', duration: 20, status: 'failed', cost: 0, budgetCode: 'GIS-2023' },
        { id: '10', date: '2023-06-05', user: 'clerk', action: 'query', layer: 'Ownership', duration: 35, status: 'success', cost: 15.75, budgetCode: 'ADMIN-2023' }
      ];
      
      // Filter by date range if needed
      const filteredData = filterDataByDateRange(mockData, dateRange);
      
      setUsageData(filteredData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected date range
  const filterDataByDateRange = (data, range) => {
    const now = new Date();
    let startDate;
    
    switch(range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'last7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  };

  // Initial data load
  useEffect(() => {
    fetchUsageData();
  }, [dateRange]);

  // Refresh data
  const handleRefresh = () => {
    fetchUsageData();
  };

  // Change date range
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  // Calculate financial summary
  const calculateFinancialSummary = () => {
    const totalCost = usageData.reduce((sum, item) => sum + (item.cost || 0), 0);
    const budgetTotal = 20000; // Example budget
    const remainingBudget = budgetTotal - totalCost;
    const costTrend = 12; // Example trend percentage
    
    return {
      totalCost,
      remainingBudget,
      costTrend
    };
  };

  const financialSummary = calculateFinancialSummary();

  // Columns configuration
  const columns = [
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    { 
      field: 'user', 
      headerName: 'User', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          color={params.value === 'admin' ? 'primary' : 'default'}
          size="small"
        />
      )
    },
    { 
      field: 'action', 
      headerName: 'Action', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          color={
            params.value === 'edit' ? 'warning' :
            params.value === 'print' ? 'info' :
            'default'
          }
          size="small"
        />
      )
    },
    { field: 'layer', headerName: 'Layer', width: 150 },
    { 
      field: 'duration', 
      headerName: 'Duration (s)', 
      width: 130,
      renderCell: (params) => (
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Box sx={{ 
            width: `${Math.min(params.value, 120)/120 * 100}%`,
            height: '8px',
            backgroundColor: theme => 
              params.value > 60 ? theme.palette.error.main :
              params.value > 30 ? theme.palette.warning.main :
              theme.palette.success.main,
            borderRadius: '4px',
            mr: 1
          }} />
          {params.value}
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          color={params.value === 'success' ? 'success' : 'error'}
          size="small"
        />
      )
    },
    { 
      field: 'cost', 
      headerName: 'Cost (BWP)', 
      width: 120,
      valueFormatter: (params) => params.value?.toFixed(2) || '0.00'
    },
    { 
      field: 'budgetCode', 
      headerName: 'Budget Code', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          variant="outlined"
        />
      )
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6" gutterBottom>
          System Usage Dashboard
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            size="small"
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => setActiveTab(activeTab === 'table' ? 'charts' : 'table')}
            startIcon={activeTab === 'table' ? <PieChartIcon /> : <BarChartIcon />}
            size="small"
          >
            {activeTab === 'table' ? 'View Charts' : 'View Table'}
          </Button>
        </Box>
      </Box>

      {/* Financial Summary Card */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2">Total Usage Cost</Typography>
                  <Typography variant="h5">
                    BWP {financialSummary.totalCost.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">Budget Remaining</Typography>
                  <Typography variant="h5" color="success.main">
                    BWP {financialSummary.remainingBudget.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">Cost Trend</Typography>
                  <Typography variant="h5" color="error.main">
                    +{financialSummary.costTrend}% ▲
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Tabs 
        value={dateRange} 
        onChange={(e, newValue) => handleDateRangeChange(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Today" value="today" />
        <Tab label="Last 7 Days" value="last7days" />
        <Tab label="Last 30 Days" value="last30days" />
        <Tab label="All Time" value="all" />
      </Tabs>
      
      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {activeTab === 'table' ? (
            <Box sx={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={usageData}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                components={{
                  Toolbar: CustomToolbar
                }}
                componentsProps={{
                  toolbar: {
                    onRefresh: handleRefresh,
                    onDateRangeClick: () => console.log("Date range picker clicked")
                  }
                }}
              />
            </Box>
          ) : (
            <Box sx={{ 
              height: 400,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme => theme.palette.grey[100],
              borderRadius: 1,
              p: 3
            }}>
              <Typography variant="body1" color="text.secondary">
                Charts visualization would be displayed here
              </Typography>
            </Box>
          )}
        </>
      )}
      
      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
        Data refreshed every 5 minutes. Last updated: {lastUpdated.toLocaleString()}
      </Typography>
    </Paper>
  );
};

export default UsageDashboard;