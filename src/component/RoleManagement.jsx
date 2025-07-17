/** @jsxRuntime classic */
/** @jsx React.createElement */

import { Add, Delete, Edit, Lock } from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    TextField,
    Typography
} from '@mui/material';
import  React, { useEffect, useState } from 'react';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {
      viewApplications: false,
      processApplications: false,
      manageLandRecords: false,
      resolveDisputes: false,
      generateReports: false,
      manageUsers: false
    }
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRoles([
        {
          id: 1,
          name: 'Administrator',
          description: 'Full system access',
          permissions: {
            viewApplications: true,
            processApplications: true,
            manageLandRecords: true,
            resolveDisputes: true,
            generateReports: true,
            manageUsers: true
          }
        },
        // More roles...
      ]);
    }, 500);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked
      }
    }));
  };

  const handleSubmit = () => {
    // API call to save role
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
          Role & Permission Management
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setCurrentRole(null);
              setFormData({
                name: '',
                description: '',
                permissions: {
                  viewApplications: false,
                  processApplications: false,
                  manageLandRecords: false,
                  resolveDisputes: false,
                  generateReports: false,
                  manageUsers: false
                }
              });
              setOpenDialog(true);
            }}
          >
            Add New Role
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#e3f2fd' }}>
              <TableRow>
                <TableCell>Role Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Typography fontWeight="bold">{role.name}</Typography>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {Object.entries(role.permissions)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                          <Chip 
                            key={key} 
                            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                            size="small"
                          />
                        ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setCurrentRole(role);
                        setFormData({
                          name: role.name,
                          description: role.description,
                          permissions: role.permissions
                        });
                        setOpenDialog(true);
                      }}
                    >
                      <Edit color="primary" />
                    </IconButton>
                    {role.name !== 'Administrator' && (
                      <IconButton>
                        <Delete color="error" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
          <DialogTitle>
            {currentRole ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Role Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={2}
              />
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Permissions
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 2
              }}>
                {Object.entries(formData.permissions).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        checked={value}
                        onChange={handlePermissionChange}
                        name={key}
                      />
                    }
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {currentRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default RoleManagement;