import {
    CheckCircle as CheckCircleIcon,
    Gavel as FraudIcon,
    PersonAddDisabled as IncompetentIcon,
    BarChart as KpiIcon,
    Assessment as PerformanceIcon,
    Lightbulb as SuggestionIcon,
    GroupWork as TeamIcon,
    CalendarToday as TimeIcon,
    School as TrainingIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Tooltip,
    Typography
} from '@mui/material';

// Sample ministry KPIs - replace with your actual KPIs
const MINISTRY_KPIS = [
  { name: "Case Processing Time", target: "≤3 days", weight: 25 },
  { name: "Decision Accuracy", target: "≥98%", weight: 30 },
  { name: "Stakeholder Satisfaction", target: "≥90%", weight: 20 },
  { name: "Policy Compliance", target: "100%", weight: 25 }
];

const PerformanceMetrics = ({ employee }) => {
  if (!employee) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No employee data available</Typography>
      </Box>
    );
  }

  // Calculate overall performance rating
  const calculatePerformanceRating = () => {
    const weights = {
      efficiency: 0.3,
      accuracy: 0.25,
      compliance: 0.25,
      teamwork: 0.2
    };
    
    return Math.round(
      (employee.efficiency * weights.efficiency) +
      (employee.accuracy * weights.accuracy) +
      (employee.compliance * weights.compliance) +
      (employee.teamwork * weights.teamwork)
    );
  };

  const performanceRating = calculatePerformanceRating();
  const isIncompetent = performanceRating < 50;
  const needsImprovement = performanceRating >= 50 && performanceRating < 75;

  // Generate performance insights
  const generatePerformanceInsights = () => {
    const insights = [];
    
    // Efficiency insights
    if (employee.efficiency < 70) {
      insights.push({
        type: 'warning',
        icon: <TimeIcon color="warning" />,
        text: `Low efficiency score (${employee.efficiency}%). Improve time management and workflow processes.`,
        action: 'Schedule efficiency training'
      });
    }
    
    // Accuracy insights
    if (employee.accuracy < 85) {
      insights.push({
        type: 'warning',
        icon: <CheckCircleIcon color="warning" />,
        text: `Accuracy rate (${employee.accuracy}%) below target. Review decision-making processes.`,
        action: 'Implement peer review system'
      });
    }
    
    // Compliance insights
    if (employee.compliance < 95) {
      insights.push({
        type: 'error',
        icon: <WarningIcon color="error" />,
        text: `Policy compliance (${employee.compliance}%) needs immediate attention.`,
        action: 'Mandatory compliance retraining'
      });
    }
    
    // Positive feedback
    if (employee.teamwork > 90) {
      insights.push({
        type: 'success',
        icon: <TeamIcon color="success" />,
        text: `Excellent teamwork score (${employee.teamwork}%). Consider for leadership role.`,
        action: 'Nominate for team lead position'
      });
    }
    
    return insights;
  };

  const performanceInsights = generatePerformanceInsights();

  // Fraud detection indicators
  const fraudIndicators = [
    ...(employee.unusualActivityCount > 2 ? [`${employee.unusualActivityCount} unusual activities flagged`] : []),
    ...(employee.approvalRate > 95 && employee.positionLevel === 'Junior' ? ['Unusually high approval rate for junior position'] : []),
    ...(employee.afterHoursAccess > 10 ? [`${employee.afterHoursAccess} after-hours system accesses`] : [])
  ];

  const hasFraudRisk = fraudIndicators.length > 0;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Employee Profile Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={employee.avatar} 
                sx={{ width: 64, height: 64, mr: 2 }}
              />
              <Box>
                <Typography variant="h6">{employee.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {employee.position}
                </Typography>
                <Typography variant="body2">{employee.department}</Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Overall Performance Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinearProgress
                  variant="determinate"
                  value={performanceRating}
                  color={
                    isIncompetent ? 'error' :
                    needsImprovement ? 'warning' : 'success'
                  }
                  sx={{ height: 10, flexGrow: 1, mr: 2 }}
                />
                <Typography variant="body1" fontWeight="bold">
                  {performanceRating}%
                </Typography>
              </Box>
              {isIncompetent && (
                <Alert severity="error" icon={<IncompetentIcon />} sx={{ mt: 1 }}>
                  Performance below acceptable threshold
                </Alert>
              )}
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Status Indicators
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {hasFraudRisk && (
                  <Tooltip title={fraudIndicators.join(', ')}>
                    <Chip
                      icon={<FraudIcon />}
                      label="Fraud Risk"
                      color="error"
                      size="small"
                    />
                  </Tooltip>
                )}
                {isIncompetent && (
                  <Chip
                    icon={<IncompetentIcon />}
                    label="Incompetent"
                    color="error"
                    size="small"
                  />
                )}
                {employee.tenure < 1 && (
                  <Chip
                    icon={<TrainingIcon />}
                    label="New Employee"
                    color="info"
                    size="small"
                  />
                )}
              </Box>
            </Box>
            
            <Button 
              variant="contained" 
              fullWidth 
              startIcon={<TrainingIcon />}
              sx={{ mt: 2 }}
            >
              Initiate Training Plan
            </Button>
          </Paper>
        </Grid>
        
        {/* Performance Breakdown */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PerformanceIcon color="primary" sx={{ mr: 1 }} />
              Performance Metrics
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">Efficiency</Typography>
                <LinearProgress
                  variant="determinate"
                  value={employee.efficiency}
                  color={employee.efficiency < 70 ? 'error' : employee.efficiency < 85 ? 'warning' : 'success'}
                  sx={{ height: 8, mt: 1 }}
                />
                <Typography variant="caption">{employee.efficiency}%</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">Accuracy</Typography>
                <LinearProgress
                  variant="determinate"
                  value={employee.accuracy}
                  color={employee.accuracy < 85 ? 'error' : employee.accuracy < 95 ? 'warning' : 'success'}
                  sx={{ height: 8, mt: 1 }}
                />
                <Typography variant="caption">{employee.accuracy}%</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">Compliance</Typography>
                <LinearProgress
                  variant="determinate"
                  value={employee.compliance}
                  color={employee.compliance < 90 ? 'error' : employee.compliance < 98 ? 'warning' : 'success'}
                  sx={{ height: 8, mt: 1 }}
                />
                <Typography variant="caption">{employee.compliance}%</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">Teamwork</Typography>
                <LinearProgress
                  variant="determinate"
                  value={employee.teamwork}
                  color={employee.teamwork < 70 ? 'error' : employee.teamwork < 85 ? 'warning' : 'success'}
                  sx={{ height: 8, mt: 1 }}
                />
                <Typography variant="caption">{employee.teamwork}%</Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Ministry KPI Alignment
            </Typography>
            <List dense>
              {MINISTRY_KPIS.map((kpi, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <KpiIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={kpi.name}
                    secondary={`Target: ${kpi.target} | Weight: ${kpi.weight}%`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
          
          {/* Performance Insights */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SuggestionIcon color="primary" sx={{ mr: 1 }} />
              Performance Insights & Recommendations
            </Typography>
            
            {performanceInsights.length > 0 ? (
              <List dense>
                {performanceInsights.map((insight, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {insight.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={insight.text}
                      secondary={insight.action}
                      primaryTypographyProps={{
                        color: insight.type === 'error' ? 'error' : 
                              insight.type === 'warning' ? 'text.primary' : 'text.secondary',
                        fontWeight: insight.type === 'error' ? 'bold' : 'normal'
                      }}
                      secondaryTypographyProps={{
                        color: 'primary',
                        fontWeight: 'medium'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="success">
                This employee meets or exceeds all performance expectations
              </Alert>
            )}
          </Paper>
          
          {/* Fraud Risk Assessment */}
          {hasFraudRisk && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FraudIcon color="error" sx={{ mr: 1 }} />
                Fraud Risk Assessment
              </Typography>
              
              <Alert severity="error" sx={{ mb: 2 }}>
                This employee has been flagged for potential fraudulent activities
              </Alert>
              
              <List dense>
                {fraudIndicators.map((indicator, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WarningIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary={indicator} />
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="error"
                  startIcon={<FraudIcon />}
                >
                  Initiate Investigation
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceMetrics;