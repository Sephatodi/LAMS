// /src/components/RiskDashboard/ImpactAssessment.jsx
import {
  ShowChart as ChartIcon,
  ListAlt as ChecklistIcon,
  Assessment as ImpactIcon,
  Warning as RiskIcon
} from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useGetImpactAssessmentQuery } from '../../api/policyApi';

const ImpactAssessment = ({ regulationId }) => {
  const { data: assessment, isLoading } = useGetImpactAssessmentQuery(regulationId);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const filteredImpacts = selectedDepartment === 'all' 
    ? assessment?.impacts || []
    : assessment?.impacts.filter(impact => impact.department === selectedDepartment) || [];

  const departments = [...new Set(assessment?.impacts?.map(impact => impact.department) || [])];

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ImpactIcon sx={{ mr: 1 }} /> Regulation Impact Assessment
      </Typography>

      {isLoading ? (
        <LinearProgress />
      ) : !assessment ? (
        <Typography variant="body1" color="text.secondary">
          Select a regulation to assess its impact
        </Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Impacts" icon={<RiskIcon />} />
              <Tab label="Metrics" icon={<ChartIcon />} />
              <Tab label="Checklist" icon={<ChecklistIcon />} />
            </Tabs>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {activeTab === 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {filteredImpacts.length} Impact Areas Identified
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {filteredImpacts.map((impact, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={impact.area}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {impact.description}
                            </Typography>
                            <br />
                            <Typography component="span" variant="caption">
                              Severity: {impact.severity} • Likelihood: {impact.likelihood}
                            </Typography>
                          </>
                        }
                      />
                      <Chip 
                        label={impact.department} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                    {index < filteredImpacts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Impact Metrics Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Card sx={{ p: 2, flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    High Risk Impacts
                  </Typography>
                  <Typography variant="h4">
                    {assessment.metrics.highRisk}
                  </Typography>
                </Card>
                <Card sx={{ p: 2, flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Departments Affected
                  </Typography>
                  <Typography variant="h4">
                    {assessment.metrics.departmentsAffected}
                  </Typography>
                </Card>
                <Card sx={{ p: 2, flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Cost Impact
                  </Typography>
                  <Typography variant="h4">
                    BWP {assessment.metrics.estimatedCost.toLocaleString()}
                  </Typography>
                </Card>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Last assessed: {new Date(assessment.assessmentDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Compliance Checklist
              </Typography>
              <List dense>
                {assessment.checklist.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.task}
                      secondary={`Due: ${new Date(item.dueDate).toLocaleDateString()} • Responsible: ${item.responsibleDepartment}`}
                    />
                    <Chip 
                      label={item.status} 
                      size="small"
                      color={
                        item.status === 'completed' ? 'success' :
                        item.status === 'in_progress' ? 'warning' : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ImpactAssessment;