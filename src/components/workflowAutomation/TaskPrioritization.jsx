// /src/components/WorkflowAutomation/TaskPrioritization.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Paper,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { 
  PriorityHigh as HighPriorityIcon,
  LowPriority as LowPriorityIcon,
  Schedule as PendingIcon,
  Done as CompletedIcon,
  Gavel as LegalIcon,
  Home as ResidentialIcon,
  Business as CommercialIcon
} from '@mui/icons-material';
import { useGetTasksQuery } from '../../api/landBoardApi';
import TaskDetailsDialog from './TaskDetailsDialog';

const TaskPrioritization = () => {
  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const [tabValue, setTabValue] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);

  // AI-powered prioritization algorithm
  const prioritizeTasks = (taskList) => {
    return taskList.map(task => {
      let priorityScore = 0;
      
      // Urgency factors (40% weight)
      priorityScore += task.deadlineProximity * 0.4;
      
      // Importance factors (30% weight)
      priorityScore += task.stakeholderImportance * 0.15;
      priorityScore += task.legalImplications * 0.15;
      
      // Complexity factors (20% weight)
      priorityScore += (1 - task.complexity) * 0.2;
      
      // Resource availability (10% weight)
      priorityScore += task.resourceAvailability * 0.1;
      
      return {
        ...task,
        priorityScore: Math.min(100, Math.round(priorityScore * 100)),
        priorityLevel: priorityScore > 80 ? 'Critical' : 
                     priorityScore > 60 ? 'High' : 
                     priorityScore > 40 ? 'Medium' : 'Low'
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  };

  const prioritizedTasks = prioritizeTasks(tasks);
  
  const filteredTasks = tabValue === 0 ? prioritizedTasks : 
                       tabValue === 1 ? prioritizedTasks.filter(t => t.priorityLevel === 'Critical') :
                       tabValue === 2 ? prioritizedTasks.filter(t => t.priorityLevel === 'High') :
                       prioritizedTasks.filter(t => t.status === 'Completed');

  const getTaskIcon = (type) => {
    switch(type) {
      case 'Legal': return <LegalIcon />;
      case 'Residential': return <ResidentialIcon />;
      case 'Commercial': return <CommercialIcon />;
      default: return <PendingIcon />;
    }
  };

  const getPriorityChip = (priority) => {
    const colorMap = {
      'Critical': 'error',
      'High': 'warning',
      'Medium': 'info',
      'Low': 'success'
    };
    
    return (
      <Chip 
        label={priority} 
        color={colorMap[priority]} 
        size="small"
        sx={{ minWidth: 80 }}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        AI-Powered Task Prioritization Engine
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Tasks" icon={<PendingIcon />} />
          <Tab label="Critical" icon={<HighPriorityIcon />} />
          <Tab label="High Priority" icon={<HighPriorityIcon />} />
          <Tab label="Completed" icon={<CompletedIcon />} />
        </Tabs>
      </Paper>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ width: '100%' }}>
          {filteredTasks.map((task) => (
            <ListItem 
              key={task.id} 
              button 
              onClick={() => setSelectedTask(task)}
              sx={{ 
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                {getTaskIcon(task.type)}
              </ListItemIcon>
              <ListItemText
                primary={task.title}
                secondary={`Due: ${task.dueDate} | Type: ${task.type}`}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tooltip title={`Priority score: ${task.priorityScore}/100`}>
                  {getPriorityChip(task.priorityLevel)}
                </Tooltip>
                <Chip 
                  label={task.status} 
                  color={task.status === 'Completed' ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      {selectedTask && (
        <TaskDetailsDialog 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </Box>
  );
};

export default TaskPrioritization;