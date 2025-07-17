import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart
} from '@mui/x-charts';
import { useState } from 'react';
import { useGetDepartmentMetricsQuery } from '../api/departmentApi';

// Mock data for when API is not available (remove in production)
const mockMetrics = {
  departments: [
    { 
      id: 1, 
      name: 'Registry', 
      completionRate: 85, 
      caseCount: 120,
      avgProcessingDays: 2.5,
      transparencyScore: 88,
      previousCompletion: 78,
      efficiency: 92
    },
    { 
      id: 2, 
      name: 'Planning', 
      completionRate: 72, 
      caseCount: 85,
      avgProcessingDays: 4.1,
      transparencyScore: 65,
      previousCompletion: 68,
      efficiency: 76
    },
    { 
      id: 3, 
      name: 'Survey', 
      completionRate: 91, 
      caseCount: 65,
      avgProcessingDays: 1.8,
      transparencyScore: 92,
      previousCompletion: 88,
      efficiency: 95
    },
    { 
      id: 4, 
      name: 'Legal', 
      completionRate: 68, 
      caseCount: 45,
      avgProcessingDays: 5.2,
      transparencyScore: 58,
      previousCompletion: 72,
      efficiency: 63
    }
  ],
  overall: {
    avgCompletion: 79,
    totalCases: 315,
    efficiencyTrend: 4.2
  }
};

const DepartmentPerformance = () => {
  const theme = useTheme();
  const { data: metrics = mockMetrics, isLoading, isError } = useGetDepartmentMetricsQuery();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  
  // Calculate department performance trend
  const getTrend = (department) => {
    if (!department.previousCompletion) return 'neutral';
    const change = department.completionRate - department.previousCompletion;
    return change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  };
  
  // Determine if department is underperforming
  const isUnderperforming = (department) => {
    return department.completionRate < 70 || department.avgProcessingDays > 4;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Department Performance Overview
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`Avg Completion: ${metrics.overall?.avgCompletion || 79}%`}
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={`Total Cases: ${metrics.overall?.totalCases || 315}`}
            color="secondary"
            variant="outlined"
          />
          <Chip 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Efficiency Trend: 
                {metrics.overall?.efficiencyTrend > 0 ? (
                  <TrendingUpIcon color="success" sx={{ ml: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" sx={{ ml: 0.5 }} />
                )}
              </Box>
            }
            variant="outlined"
          />
        </Box>
      </Box>
      
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load department data. Showing mock data for demonstration.
        </Alert>
      )}
      
      {isLoading ? (
        <LinearProgress />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Task Completion Rate (%)
                </Typography>
                <Tooltip title="Target: ≥80% completion rate">
                  <HelpOutlineIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <BarChart
                xAxis={[{ 
                  scaleType: 'band', 
                  data: metrics.departments.map(d => d.name),
                  label: 'Departments'
                }]}
                yAxis={[{
                  label: 'Completion Rate (%)',
                  min: 0,
                  max: 100
                }]}
                series={[{ 
                  data: metrics.departments.map(d => d.completionRate),
                  label: 'Completion Rate',
                  color: theme.palette.primary.main
                }]}
                height={300}
                tooltip={{ trigger: 'item' }}
              />
            </Paper>
            
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Case Distribution
                </Typography>
                <Tooltip title="Distribution of cases across departments">
                  <HelpOutlineIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <PieChart
                series={[{
                  data: metrics.departments.map(d => ({
                    id: d.id,
                    value: d.caseCount,
                    label: d.name
                  })),
                  innerRadius: 40,
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -5, color: 'gray' }
                }]}
                height={300}
                slotProps={{
                  legend: {
                    direction: 'row',
                    position: { vertical: 'bottom', horizontal: 'middle' },
                    padding: 0,
                  },
                }}
              />
            </Paper>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Efficiency Analysis
                </Typography>
                <Tooltip title="Combined efficiency score based on completion rate and processing time">
                  <HelpOutlineIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <ScatterChart
                xAxis={[{ 
                  label: 'Processing Days', 
                  min: 0, 
                  max: 7 
                }]}
                yAxis={[{ 
                  label: 'Completion Rate (%)', 
                  min: 50, 
                  max: 100 
                }]}
                series={metrics.departments.map(d => ({
                  type: 'scatter',
                  label: d.name,
                  data: [{ 
                    x: d.avgProcessingDays, 
                    y: d.completionRate, 
                    id: d.id 
                  }],
                  color: isUnderperforming(d) ? theme.palette.error.main : theme.palette.success.main,
                  onClick: (event, itemData) => {
                    const dept = metrics.departments.find(d => d.id === itemData.id);
                    setSelectedDepartment(dept);
                  }
                }))}
                height={300}
              />
            </Paper>
            
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Performance Trend
                </Typography>
                <Tooltip title="Comparison with previous period">
                  <HelpOutlineIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <LineChart
                xAxis={[{ 
                  data: metrics.departments.map(d => d.name),
                  scaleType: 'point' 
                }]}
                yAxis={[{ 
                  label: 'Completion Rate (%)', 
                  min: 50, 
                  max: 100 
                }]}
                series={[
                  {
                    label: 'Current Period',
                    data: metrics.departments.map(d => d.completionRate),
                    color: theme.palette.primary.main
                  },
                  {
                    label: 'Previous Period',
                    data: metrics.departments.map(d => d.previousCompletion || d.completionRate - 5),
                    color: theme.palette.secondary.main
                  }
                ]}
                height={300}
              />
            </Paper>
          </Box>
        </Box>
      )}
      
      {/* Department Detail Dialog */}
      {selectedDepartment && (
        <Dialog open={!!selectedDepartment} onClose={() => setSelectedDepartment(null)}>
          <DialogTitle>
            <Typography variant="h6">{selectedDepartment.name} Department</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box>
                <Typography variant="subtitle2">Completion Rate</Typography>
                <Typography variant="h5" color="primary">
                  {selectedDepartment.completionRate}%
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  {getTrend(selectedDepartment) === 'up' ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : getTrend(selectedDepartment) === 'down' ? (
                    <TrendingDownIcon color="error" fontSize="small" />
                  ) : null}
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {selectedDepartment.completionRate - selectedDepartment.previousCompletion}%
                    from previous
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Avg Processing Time</Typography>
                <Typography variant="h5" 
                  color={selectedDepartment.avgProcessingDays > 4 ? 'error' : 'primary'}>
                  {selectedDepartment.avgProcessingDays} days
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Cases Handled</Typography>
                <Typography variant="h5">
                  {selectedDepartment.caseCount}
                </Typography>
              </Box>
            </Box>
            
            {isUnderperforming(selectedDepartment) && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  This department is underperforming in key metrics:
                </Typography>
                <ul>
                  {selectedDepartment.completionRate < 70 && (
                    <li>Completion rate below target (70%)</li>
                  )}
                  {selectedDepartment.avgProcessingDays > 4 && (
                    <li>Processing time exceeds target (4 days)</li>
                  )}
                </ul>
              </Alert>
            )}
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Recommendations:
              </Typography>
              <ul>
                {selectedDepartment.completionRate < 75 && (
                  <li>Implement workflow optimization training</li>
                )}
                {selectedDepartment.avgProcessingDays > 4 && (
                  <li>Streamline approval processes with automation</li>
                )}
                {selectedDepartment.transparencyScore < 70 && (
                  <li>Enhance documentation and record keeping</li>
                )}
              </ul>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedDepartment(null)}>Close</Button>
            <Button variant="contained" color="primary">
              Generate Report
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default DepartmentPerformance;