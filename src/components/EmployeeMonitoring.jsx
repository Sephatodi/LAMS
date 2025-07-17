import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Gavel as FraudIcon,
  PersonAddDisabled as IncompetentIcon,
  Info as InfoIcon,
  Lightbulb as SuggestionIcon,
  School as TrainingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar
} from '@mui/x-data-grid';
import { useState } from 'react';
import { useGetEmployeesQuery } from '../api/employeeApi.js';

// Ministry vision and KPIs
const MINISTRY_VISION = {
  goals: [
    "Efficient land allocation processes",
    "Transparent record keeping",
    "Sustainable land use",
    "Equitable access to land resources",
    "Zero corruption tolerance"
  ],
  kpis: [
    { name: "Processing Time", target: "≤3 days" },
    { name: "Accuracy Rate", target: "≥98%" },
    { name: "Stakeholder Satisfaction", target: "≥90%" },
    { name: "Case Resolution", target: "≥95%" }
  ]
};

const EmployeeMonitoring = () => {
  const { data: employees = [], isLoading } = useGetEmployeesQuery();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Performance evaluation logic
  const evaluatePerformance = (employee) => {
    const suggestions = [];
    let isIncompetent = false;
    let fraudRisk = false;
    let fraudIndicators = [];

    // Performance analysis
    if (employee.performanceScore < 50) {
      isIncompetent = true;
      suggestions.push({
        icon: <TrainingIcon color="warning" />,
        text: "Urgent training needed in core competencies",
        priority: "high"
      });
    }

    if (employee.caseResolutionRate < 70) {
      suggestions.push({
        icon: <InfoIcon color="info" />,
        text: "Improve case resolution techniques through mentoring",
        priority: "medium"
      });
    }

    // Fraud detection
    if (employee.unusualActivityCount > 3) {
      fraudRisk = true;
      fraudIndicators.push(`High number of unusual activities (${employee.unusualActivityCount})`);
    }

    if (employee.approvalRate > 95 && employee.seniority === 'Junior') {
      fraudRisk = true;
      fraudIndicators.push("Unusually high approval rate for junior staff");
    }

    if (fraudRisk) {
      suggestions.push({
        icon: <FraudIcon color="error" />,
        text: "Potential fraud risk detected - needs investigation",
        priority: "critical"
      });
    }

    // Ministry vision alignment suggestions
    if (employee.landUseCompliance < 80) {
      suggestions.push({
        icon: <SuggestionIcon color="info" />,
        text: "Additional training needed on sustainable land use policies",
        priority: "medium"
      });
    }

    if (employee.transparencyScore < 75) {
      suggestions.push({
        icon: <SuggestionIcon color="info" />,
        text: "Improve documentation practices for better transparency",
        priority: "high"
      });
    }

    // Sort suggestions by priority
    suggestions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return { suggestions, isIncompetent, fraudRisk, fraudIndicators };
  };

  const columns = [
    { 
      field: 'employee', 
      headerName: 'Employee', 
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={params.row.avatar} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="body2">{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.position} ({params.row.department})
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'performance', 
      headerName: 'Performance', 
      width: 200,
      renderCell: (params) => {
        const { isIncompetent } = evaluatePerformance(params.row);
        return (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <LinearProgress 
                variant="determinate" 
                value={params.row.performanceScore} 
                color={
                  params.row.performanceScore > 80 ? 'success' :
                  params.row.performanceScore > 50 ? 'warning' : 'error'
                }
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  flexGrow: 1,
                  mr: 1 
                }}
              />
              <Typography variant="caption" sx={{ minWidth: 40 }}>
                {params.row.performanceScore}%
              </Typography>
            </Box>
            {isIncompetent && (
              <Chip 
                icon={<IncompetentIcon fontSize="small" />}
                label="Incompetent" 
                size="small"
                color="error"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
        );
      }
    },
    { 
      field: 'risk', 
      headerName: 'Risk Assessment', 
      width: 150,
      renderCell: (params) => {
        const { fraudRisk, fraudIndicators } = evaluatePerformance(params.row);
        return fraudRisk ? (
          <Tooltip title={fraudIndicators.join(', ')} arrow>
            <Chip 
              icon={<FraudIcon fontSize="small" />}
              label="High Risk" 
              size="small"
              color="error"
            />
          </Tooltip>
        ) : (
          <Chip 
            icon={<CheckCircleIcon fontSize="small" />}
            label="Low Risk" 
            size="small"
            color="success"
          />
        );
      }
    },
    { 
      field: 'actions', 
      headerName: 'Actions',
      type: 'actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<InfoIcon color="primary" />}
          label="View Details"
          onClick={() => {
            setSelectedEmployee(params.row);
            setOpenDialog(true);
          }}
        />
      ]
    }
  ];

  const enhancedEmployees = employees.map(emp => ({
    ...emp,
    ...evaluatePerformance(emp)
  }));

  return (
    <Box sx={{ height: '75vh', width: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Employee Performance Monitoring
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" icon={<InfoIcon />}>
          Monitoring aligned with Ministry Vision: {MINISTRY_VISION.goals.join(', ')}
        </Alert>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          <DataGrid
            rows={enhancedEmployees}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: 'none'
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }
            }}
          />

          {/* Employee Detail Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)}
            maxWidth="md"
            fullWidth
          >
            {selectedEmployee && (
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={selectedEmployee.avatar} 
                      sx={{ mr: 2, width: 56, height: 56 }}
                    />
                    <Box>
                      <Typography variant="h6">{selectedEmployee.name}</Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {selectedEmployee.position} | {selectedEmployee.department}
                      </Typography>
                    </Box>
                  </Box>
                </DialogTitle>
                <DialogContent dividers>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Performance Overview
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">Overall Performance</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={selectedEmployee.performanceScore} 
                          color={
                            selectedEmployee.performanceScore > 80 ? 'success' :
                            selectedEmployee.performanceScore > 50 ? 'warning' : 'error'
                          }
                          sx={{ height: 10, borderRadius: 5, mt: 1 }}
                        />
                        <Typography variant="caption">
                          {selectedEmployee.performanceScore}%
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">Case Resolution Rate</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={selectedEmployee.caseResolutionRate} 
                          color={
                            selectedEmployee.caseResolutionRate > 90 ? 'success' :
                            selectedEmployee.caseResolutionRate > 70 ? 'warning' : 'error'
                          }
                          sx={{ height: 10, borderRadius: 5, mt: 1 }}
                        />
                        <Typography variant="caption">
                          {selectedEmployee.caseResolutionRate}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {selectedEmployee.fraudRisk && (
                    <Box sx={{ mb: 3 }}>
                      <Alert severity="error" icon={<FraudIcon />}>
                        <Typography variant="subtitle2" gutterBottom>
                          Fraud Risk Detected
                        </Typography>
                        <List dense>
                          {selectedEmployee.fraudIndicators.map((indicator, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <WarningIcon color="error" />
                              </ListItemIcon>
                              <ListItemText primary={indicator} />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    </Box>
                  )}

                  {selectedEmployee.isIncompetent && (
                    <Box sx={{ mb: 3 }}>
                      <Alert severity="warning" icon={<IncompetentIcon />}>
                        <Typography variant="subtitle2">
                          This employee has been flagged as incompetent based on performance metrics.
                        </Typography>
                      </Alert>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Performance Improvement Suggestions
                    </Typography>
                    <List dense>
                      {selectedEmployee.suggestions?.map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {suggestion.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={suggestion.text}
                            primaryTypographyProps={{
                              color: suggestion.priority === 'critical' ? 'error' : 
                                    suggestion.priority === 'high' ? 'text.primary' : 'text.secondary',
                              fontWeight: suggestion.priority === 'critical' ? 'bold' : 'normal'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Ministry KPIs Alignment
                    </Typography>
                    <List dense>
                      {MINISTRY_VISION.kpis.map((kpi, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {kpi.name === "Processing Time" && selectedEmployee.avgProcessingDays > 3 ? (
                              <ErrorIcon color="error" />
                            ) : (
                              <CheckCircleIcon color="success" />
                            )}
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${kpi.name}: Target ${kpi.target}`}
                            secondary={
                              kpi.name === "Processing Time" ? 
                              `Actual: ${selectedEmployee.avgProcessingDays} days` :
                              null
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button 
                    onClick={() => setOpenDialog(false)}
                    color="primary"
                  >
                    Close
                  </Button>
                  <Button 
                    variant="contained"
                    color="primary"
                    startIcon={<TrainingIcon />}
                  >
                    Initiate Training
                  </Button>
                  {selectedEmployee.fraudRisk && (
                    <Button 
                      variant="contained"
                      color="error"
                      startIcon={<FraudIcon />}
                    >
                      Flag for Investigation
                    </Button>
                  )}
                </DialogActions>
              </>
            )}
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default EmployeeMonitoring;