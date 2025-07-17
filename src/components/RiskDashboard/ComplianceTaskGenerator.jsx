// /src/components/RiskDashboard/ComplianceTaskGenerator.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  Chip,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import { 
  Task as TaskIcon,
  PlaylistAdd as GenerateIcon,
  AddCircle as AddIcon,
  AssignmentTurnedIn as CompleteIcon,
  Schedule as ScheduledIcon
} from '@mui/icons-material';
import { useGenerateComplianceTasksMutation } from '../../api/policyApi';

const ComplianceTaskGenerator = ({ regulationId }) => {
  const [generateTasks, { data: generatedTasks, isLoading }] = useGenerateComplianceTasksMutation();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    description: '',
    department: '',
    dueDate: '',
    priority: 'medium'
  });

  const departments = [
    'Land Allocation',
    'Records Management',
    'Legal Services',
    'Finance',
    'Planning',
    'IT'
  ];

  const handleGenerate = async () => {
    try {
      const result = await generateTasks(regulationId).unwrap();
      setTasks(result.tasks);
    } catch (error) {
      console.error('Task generation failed:', error);
    }
  };

  const handleAddTask = () => {
    if (newTask.description && newTask.department) {
      setTasks([...tasks, {
        ...newTask,
        id: Date.now().toString(),
        status: 'pending',
        regulationId
      }]);
      setNewTask({
        description: '',
        department: '',
        dueDate: '',
        priority: 'medium'
      });
    }
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { 
        ...task, 
        status: task.status === 'completed' ? 'pending' : 'completed' 
      } : task
    ));
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <TaskIcon sx={{ mr: 1 }} /> Compliance Task Generator
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<GenerateIcon />}
          onClick={handleGenerate}
          disabled={isLoading}
        >
          Generate Standard Tasks
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddTask}
          disabled={!newTask.description || !newTask.department}
        >
          Add Custom Task
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Task Description"
          variant="outlined"
          value={newTask.description}
          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={newTask.department}
            onChange={(e) => setNewTask({...newTask, department: e.target.value})}
            label="Department"
          >
            {departments.map(dept => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Due Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
          value={newTask.dueDate}
          onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={newTask.priority}
            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
            label="Priority"
          >
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {tasks.length > 0 ? (
        <List sx={{ maxHeight: 'calc(100% - 200px)', overflow: 'auto' }}>
          {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <ListItem>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={task.status === 'completed'}
                    onChange={() => toggleTaskComplete(task.id)}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={task.description}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {task.department}
                      </Typography>
                      {task.dueDate && (
                        <>
                          {' • '}
                          <Typography component="span" variant="body2">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Chip 
                    label={task.priority} 
                    size="small"
                    color={
                      task.priority === 'high' ? 'error' :
                      task.priority === 'medium' ? 'warning' : 'default'
                    }
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  {task.status === 'completed' ? (
                    <CompleteIcon color="success" />
                  ) : (
                    <ScheduledIcon color="action" />
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              {index < tasks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 200,
          color: 'text.secondary'
        }}>
          <TaskIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography>No compliance tasks generated yet</Typography>
          <Typography variant="caption">
            Click "Generate Standard Tasks" or create custom tasks
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ComplianceTaskGenerator;