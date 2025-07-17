/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    Alert,
    Box, Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl, IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
 
import { Delete, Edit, LockReset, PersonAdd } from '@mui/icons-material';
import axios from 'axios';
import format from 'date-fns/format';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [passwordResetDialog, setPasswordResetDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    nationalId: '',
    role: 'applicant',
    password: '',
    temporary: false,
    expiresAt: ''
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open dialog for new user
  const handleNewUser = () => {
    setCurrentUser(null);
    setFormData({
      fullName: '',
      email: '',
      nationalId: '',
      role: 'applicant',
      password: '',
      temporary: false,
      expiresAt: ''
    });
    setOpenDialog(true);
  };

  // Open dialog to edit user
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      nationalId: user.nationalId || '',
      role: user.role,
      password: '',
      temporary: user.temporary || false,
      expiresAt: user.expiresAt ? format(new Date(user.expiresAt), 'yyyy-MM-dd') : ''
    });
    setOpenDialog(true);
  };

  // Open password reset dialog
  const handleOpenPasswordReset = (user) => {
    setCurrentUser(user);
    setPasswordResetDialog(true);
  };

  // Submit user form
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (currentUser) {
        // Update existing user
        await axios.put(`/api/users/${currentUser._id}`, formData);
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        // Create new user
        await axios.post('/api/users', formData);
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      }
      
      fetchUsers();
      setOpenDialog(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/users/${currentUser._id}/reset-password`);
      setSnackbar({ open: true, message: 'Password reset initiated', severity: 'success' });
      setPasswordResetDialog(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Password reset failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/users/${userId}`);
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Deletion failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={handleNewUser}
          >
            Add New User
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>National ID</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Account Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.nationalId || 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1,
                        backgroundColor: 
                          user.role === 'admin' ? 'primary.light' : 
                          user.role === 'officer' ? 'secondary.light' : 'grey.200',
                        color: 'common.black',
                        textAlign: 'center'
                      }}>
                        {user.role.toUpperCase()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.temporary ? (
                        <Box sx={{ color: 'warning.main' }}>
                          Temporary (expires: {format(new Date(user.expiresAt), 'dd/MM/yyyy')})
                        </Box>
                      ) : (
                        <Box sx={{ color: 'success.main' }}>Permanent</Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditUser(user)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleOpenPasswordReset(user)}>
                        <LockReset />
                      </IconButton>
                      {user.role !== 'admin' && (
                        <IconButton color="error" onClick={() => handleDeleteUser(user._id)}>
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* User Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="National ID"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleInputChange}
              margin="normal"
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="officer">Land Board Officer</MenuItem>
                <MenuItem value="applicant">Applicant</MenuItem>
              </Select>
            </FormControl>
            {!currentUser && (
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            )}
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Temporary Account</InputLabel>
                <Select
                  name="temporary"
                  value={formData.temporary}
                  onChange={(e) => setFormData({
                    ...formData,
                    temporary: e.target.value === 'true'
                  })}
                  label="Temporary Account"
                >
                  <MenuItem value={false}>Permanent</MenuItem>
                  <MenuItem value={true}>Temporary</MenuItem>
                </Select>
              </FormControl>
              {formData.temporary && (
                <TextField
                  fullWidth
                  label="Expiry Date"
                  name="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : currentUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordResetDialog} onClose={() => setPasswordResetDialog(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset password for {currentUser?.email}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            A temporary password will be generated and sent to the user&apos;s email.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordResetDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleResetPassword} 
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement;