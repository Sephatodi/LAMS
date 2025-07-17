// /src/utils/APIIntegrator.jsx
import {
  Add as AddIcon,
  Api as ApiIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Switch,
  TextField,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useGetApiConnectionsQuery, useTestApiConnectionMutation } from '../../api/integrationApi';

const APIIntegrator = () => {
  const { data: connections = [], isLoading } = useGetApiConnectionsQuery();
  const [testConnection] = useTestApiConnectionMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: '',
    endpoint: '',
    authType: 'api_key',
    apiKey: '',
    isActive: true
  });
  const [testResults, setTestResults] = useState({});

  const handleTestConnection = async (connectionId) => {
    try {
      const result = await testConnection(connectionId).unwrap();
      setTestResults(prev => ({
        ...prev,
        [connectionId]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [connectionId]: { success: false, message: error.message }
      }));
    }
  };

  const handleAddConnection = () => {
    // In a real app, would save to backend
    setOpenDialog(false);
    setNewConnection({
      name: '',
      endpoint: '',
      authType: 'api_key',
      apiKey: '',
      isActive: true
    });
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ApiIcon sx={{ mr: 1 }} /> API Integration Hub
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Connection
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 100px)', overflow: 'auto' }}>
          {connections.map((connection, index) => (
            <React.Fragment key={connection.id}>
              <ListItem>
                <ListItemText
                  primary={connection.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {connection.endpoint}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        {connection.authType} • Last sync: {connection.lastSync ? new Date(connection.lastSync).toLocaleString() : 'Never'}
                      </Typography>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {testResults[connection.id] && (
                    <Chip 
                      label={testResults[connection.id].success ? 'Success' : 'Failed'} 
                      size="small"
                      color={testResults[connection.id].success ? 'success' : 'error'}
                    />
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SyncIcon />}
                    onClick={() => handleTestConnection(connection.id)}
                  >
                    Test
                  </Button>
                  <Switch 
                    checked={connection.isActive}
                    color="primary"
                  />
                </Box>
              </ListItem>
              {index < connections.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* New Connection Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New API Connection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Connection Name"
            fullWidth
            variant="standard"
            value={newConnection.name}
            onChange={(e) => setNewConnection({...newConnection, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="API Endpoint"
            fullWidth
            variant="standard"
            value={newConnection.endpoint}
            onChange={(e) => setNewConnection({...newConnection, endpoint: e.target.value})}
          />
          <FormControl fullWidth margin="normal" variant="standard">
            <InputLabel>Authentication Type</InputLabel>
            <Select
              value={newConnection.authType}
              onChange={(e) => setNewConnection({...newConnection, authType: e.target.value})}
            >
              <MenuItem value="api_key">API Key</MenuItem>
              <MenuItem value="oauth">OAuth 2.0</MenuItem>
              <MenuItem value="basic">Basic Auth</MenuItem>
            </Select>
          </FormControl>
          {newConnection.authType === 'api_key' && (
            <TextField
              margin="dense"
              label="API Key"
              fullWidth
              variant="standard"
              value={newConnection.apiKey}
              onChange={(e) => setNewConnection({...newConnection, apiKey: e.target.value})}
            />
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Active:
            </Typography>
            <Switch 
              checked={newConnection.isActive}
              onChange={(e) => setNewConnection({...newConnection, isActive: e.target.checked})}
              color="primary"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddConnection}
            disabled={!newConnection.name || !newConnection.endpoint}
          >
            Add Connection
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default APIIntegrator;