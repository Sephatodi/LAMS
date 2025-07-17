// /src/components/WorkflowAutomation/DeadlineManager.jsx
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  LinearProgress, 
  Chip, 
  List, 
  ListItem, 
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { 
  Event as EventIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useGetDeadlinesQuery } from '../../api/landBoardApi';
import { format, differenceInDays, isBefore, isToday } from 'date-fns';

const DeadlineManager = () => {
  const { data: deadlines = [], isLoading } = useGetDeadlinesQuery();
  const [tabValue, setTabValue] = useState(0);
  const [slaMetrics, setSlaMetrics] = useState(null);

  useEffect(() => {
    if (deadlines.length > 0) {
      const completedOnTime = deadlines.filter(d => d.status === 'Completed' && !d.isOverdue).length;
      const completedLate = deadlines.filter(d => d.status === 'Completed' && d.isOverdue).length;
      const pendingOnTime = deadlines.filter(d => d.status === 'Pending' && !d.isOverdue).length;
      const pendingLate = deadlines.filter(d => d.status === 'Pending' && d.isOverdue).length;
      
      setSlaMetrics({
        completionRate: Math.round((completedOnTime / deadlines.length) * 100),
        overdueRate: Math.round(((completedLate + pendingLate) / deadlines.length) * 100),
        pendingCount: pendingOnTime + pendingLate,
        criticalOverdue: deadlines.filter(d => d.isOverdue && d.priority === 'Critical').length
      });
    }
  }, [deadlines]);

  const filteredDeadlines = tabValue === 0 ? deadlines :
                          tabValue === 1 ? deadlines.filter(d => d.isOverdue) :
                          deadlines.filter(d => d.priority === 'Critical');

  const getDeadlineStatus = (dueDate, status) => {
    if (status === 'Completed') return { color: 'success', icon: <CheckCircleIcon />, label: 'Completed' };
    
    const daysRemaining = differenceInDays(new Date(dueDate), new Date());
    
    if (isBefore(new Date(dueDate), new Date())) {
      return { color: 'error', icon: <ErrorIcon />, label: `Overdue by ${Math.abs(daysRemaining)} days` };
    }
    if (isToday(new Date(dueDate))) {
      return { color: 'warning', icon: <WarningIcon />, label: 'Due today' };
    }
    return { color: 'info', icon: <EventIcon />, label: `Due in ${daysRemaining} days` };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TimelineIcon sx={{ mr: 1 }} /> SLA & Deadline Management
      </Typography>
      
      {slaMetrics && (
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Completion Rate</Typography>
              <LinearProgress 
                variant="determinate" 
                value={slaMetrics.completionRate} 
                color={
                  slaMetrics.completionRate > 90 ? 'success' :
                  slaMetrics.completionRate > 70 ? 'warning' : 'error'
                }
                sx={{ height: 10, mb: 1 }}
              />
              <Typography variant="h4">{slaMetrics.completionRate}%</Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Overdue Rate</Typography>
              <LinearProgress 
                variant="determinate" 
                value={slaMetrics.overdueRate} 
                color={
                  slaMetrics.overdueRate < 5 ? 'success' :
                  slaMetrics.overdueRate < 15 ? 'warning' : 'error'
                }
                sx={{ height: 10, mb: 1 }}
              />
              <Typography variant="h4">{slaMetrics.overdueRate}%</Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Pending Tasks</Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>{slaMetrics.pendingCount}</Typography>
              <Chip 
                label={`${slaMetrics.criticalOverdue} critical overdue`} 
                color="error" 
                size="small"
              />
            </CardContent>
          </Card>
        </Box>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Deadlines" />
          <Tab label="Overdue" />
          <Tab label="Critical" />
        </Tabs>
      </Paper>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ width: '100%' }}>
          {filteredDeadlines.map((deadline) => {
            const status = getDeadlineStatus(deadline.dueDate, deadline.status);
            
            return (
              <ListItem key={deadline.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'background.paper' }}>
                        {status.icon}
                      </Avatar>
                    }
                  >
                    <Avatar sx={{ bgcolor: 'action.selected' }}>
                      {deadline.type === 'Legal' ? <EventIcon /> : <TimelineIcon />}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={deadline.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {format(new Date(deadline.dueDate), 'PPP')}
                      </Typography>
                      {` — ${status.label}`}
                    </>
                  }
                />
                <Chip 
                  label={deadline.priority} 
                  color={
                    deadline.priority === 'Critical' ? 'error' :
                    deadline.priority === 'High' ? 'warning' : 'default'
                  }
                  size="small"
                  variant="outlined"
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default DeadlineManager;