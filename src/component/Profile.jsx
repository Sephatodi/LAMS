/** @jsxRuntime classic */
/** @jsx React.createElement */


import {
    Cancel, CloudUpload, DateRange, Edit, Email, History, LocationOn, Lock,
    Person, Phone, Save, VerifiedUser, Visibility, VisibilityOff, Work
} from '@mui/icons-material';
import {
    Alert, Avatar, Badge, Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Divider, Grid, IconButton, LinearProgress, List, ListItem,
    ListItemText, Skeleton, Snackbar, TextField, Typography
} from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import ActivityTimeline from './ActivityTimeline';
import ErrorBoundary from './ErrorBoundary';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  
  // State initialization
  const [profile, setProfile] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    dob: '',
    role: '',
    office: '',
    profilePicture: '',
    lastLogin: ''
  });
  
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState({
    profile: true,
    activity: true,
    saving: false,
    password: false,
    imageUpload: false
  });
  const [error, setError] = useState({
    profile: false,
    activity: false,
    save: false,
    password: false,
    imageUpload: false
  });
  const [notifications, setNotifications] = useState({
    show: false,
    message: '',
    severity: 'success'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [_selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Password requirements
  const passwordRequirements = [
    { text: 'At least 8 characters', regex: /.{8,}/ },
    { text: 'At least one uppercase letter', regex: /[A-Z]/ },
    { text: 'At least one lowercase letter', regex: /[a-z]/ },
    { text: 'At least one number', regex: /\d/ },
    { text: 'At least one special character', regex: /[^A-Za-z0-9]/ },
  ];

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      setError(prev => ({ ...prev, profile: false }));
      
      const response = await api.get(`/users/${user?.id}`);
      const data = await response.json();
      
      if (!data.id || !data.email) {
        throw new Error('Invalid profile data');
      }
      
      setProfile(data);
      if (data.profilePicture) {
        setImagePreview(`${import.meta.VITE_API_URL}${data.profilePicture}`);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(prev => ({ ...prev, profile: true }));
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, [api, user?.id]);

  // Fetch activity log
  const fetchActivityLog = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, activity: true }));
      setError(prev => ({ ...prev, activity: false }));
      
      const response = await api.get(`/users/${user?.id}/activity`);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid activity data');
      }
      
      setActivityLog(data);
    } catch (err) {
      console.error('Activity log fetch error:', err);
      setError(prev => ({ ...prev, activity: true }));
      showNotification('Failed to load activity log', 'error');
    } finally {
      setLoading(prev => ({ ...prev, activity: false }));
    }
  }, [api, user?.id]);

  // Handle image selection and upload
  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.match('image.*')) {
        showNotification('Please select a valid image file', 'error');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        showNotification('Image size should be less than 2MB', 'error');
        return;
      }
      
      setSelectedImage(file);
      
      // Preview image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);

      // Upload image
      try {
        setLoading(prev => ({ ...prev, imageUpload: true }));
        setError(prev => ({ ...prev, imageUpload: false }));
        
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        await api.put(`/users/${user?.id}/picture`, formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });
        
        showNotification('Profile picture updated successfully', 'success');
        fetchProfile(); // Refresh profile data
      } catch (error) {
        console.error('Image upload error:', error);
        setError(prev => ({ ...prev, imageUpload: true }));
        showNotification('Failed to update profile picture', 'error');
      } finally {
        setLoading(prev => ({ ...prev, imageUpload: false }));
        setUploadProgress(0);
      }
    }
  };

  // Show notification
  const showNotification = (message, severity) => {
    setNotifications({ show: true, message, severity });
    setTimeout(() => setNotifications(prev => ({ ...prev, show: false })), 5000);
  };

  // Handle profile field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle password field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setError(prev => ({ ...prev, save: false }));
      
      if (!profile.firstName || !profile.lastName || !profile.email) {
        throw new Error('Required fields are missing');
      }
      
      const response = await api.put(`/users/${user?.id}`, profile);
      const data = await response.json();
      
      if (data.success) {
        updateUser(data.user);
        setEditMode(false);
        showNotification('Profile updated successfully', 'success');
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(prev => ({ ...prev, save: true }));
      showNotification(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Change password
  const handlePasswordChangeSubmit = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      setLoading(prev => ({ ...prev, password: true }));
      setError(prev => ({ ...prev, password: false }));
      
      const response = await api.put(`/users/${user?.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPasswordMode(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showNotification('Password changed successfully', 'success');
      } else {
        throw new Error(data.message || 'Password change failed');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError(prev => ({ ...prev, password: true }));
      showNotification(err.message || 'Failed to change password', 'error');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch {
      return dateString;
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchProfile();
    fetchActivityLog();
  }, [fetchProfile, fetchActivityLog]);

  return (
    <Container maxWidth="lg">
      <Snackbar
        open={notifications.show}
        autoHideDuration={5000}
        onClose={() => setNotifications(prev => ({ ...prev, show: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notifications.severity}>
          {notifications.message}
        </Alert>
      </Snackbar>

      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Person sx={{ mr: 1 }} />
          My Profile
        </Typography>
        
        <Grid container spacing={3}>
          {/* Profile Column */}
          <Grid item xs={12} md={6}>
            <ErrorBoundary fallback={<Alert severity="error">Profile section failed to load</Alert>}>
              <Card>
                <CardContent>
                  {loading.profile ? (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="circular" width={72} height={72} sx={{ mr: 2 }} />
                        <Box>
                          <Skeleton variant="text" width={200} height={40} />
                          <Skeleton variant="text" width={150} height={24} />
                          <Skeleton variant="text" width={180} height={20} />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Skeleton variant="rounded" width={100} height={36} />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <IconButton 
                              component="label"
                              size="small"
                              sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
                              disabled={loading.imageUpload}
                            >
                              <CloudUpload fontSize="small" />
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </IconButton>
                          }
                        >
                          <Avatar
                            sx={{ width: 72, height: 72, mr: 2 }}
                            src={imagePreview || undefined}
                          >
                            {profile.firstName?.charAt(0) || ''}{profile.lastName?.charAt(0) || ''}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="h5">
                            {profile.firstName} {profile.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {profile.role} • {profile.office}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last login: {profile.lastLogin ? formatDate(profile.lastLogin) : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant={editMode ? 'outlined' : 'contained'}
                          startIcon={editMode ? <Cancel /> : <Edit />}
                          onClick={() => {
                            setEditMode(!editMode);
                            if (editMode) fetchProfile();
                          }}
                          disabled={loading.saving || loading.imageUpload}
                        >
                          {editMode ? 'Cancel' : 'Edit'}
                        </Button>
                        {editMode && (
                          <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                            disabled={loading.saving || loading.imageUpload}
                          >
                            {loading.saving ? <CircularProgress size={24} /> : 'Save'}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                  
                  {loading.imageUpload && uploadProgress > 0 && (
                    <Box sx={{ width: '100%', mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Uploading: {uploadProgress}%
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {error.profile ? (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      Failed to load profile data. <Button onClick={fetchProfile}>Retry</Button>
                    </Alert>
                  ) : loading.profile ? (
                    <Box>
                      <Skeleton variant="rectangular" width="100%" height={400} />
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={profile.firstName || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading.imageUpload}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={profile.lastName || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading.imageUpload}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={profile.email || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading.imageUpload}
                          margin="normal"
                          InputProps={{
                            startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={profile.phone || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading.imageUpload}
                          margin="normal"
                          InputProps={{
                            startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="ID Number"
                          name="idNumber"
                          value={profile.idNumber || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading.imageUpload}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Date of Birth"
                          name="dob"
                          type="date"
                          value={profile.dob || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading.imageUpload}
                          margin="normal"
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: <DateRange sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          name="address"
                          value={profile.address || ''}
                          onChange={handleChange}
                          disabled={!editMode || loading.imageUpload}
                          margin="normal"
                          multiline
                          rows={2}
                          InputProps={{
                            startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Role"
                          name="role"
                          value={profile.role || ''}
                          disabled
                          margin="normal"
                          InputProps={{
                            startAdornment: <Work sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Land Board Office"
                          name="office"
                          value={profile.office || ''}
                          disabled
                          margin="normal"
                          InputProps={{
                            startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>

              {/* Change Password Card */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Lock sx={{ mr: 1 }} />
                      Change Password
                    </Typography>
                    <Button
                      variant={passwordMode ? 'outlined' : 'contained'}
                      startIcon={<Lock />}
                      onClick={() => {
                        setPasswordMode(!passwordMode);
                        if (passwordMode) {
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }
                      }}
                      disabled={loading.password || loading.imageUpload}
                    >
                      {passwordMode ? 'Cancel' : 'Change Password'}
                    </Button>
                  </Box>
                  
                  {passwordMode && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        margin="normal"
                        InputProps={{
                          startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
                          endAdornment: (
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          )
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        margin="normal"
                        InputProps={{
                          startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                      
                      <PasswordStrengthMeter password={passwordData.newPassword} />
                      
                      <List dense sx={{ mt: 1, mb: 2 }}>
                        {passwordRequirements.map((req, i) => (
                          <ListItem key={i} sx={{ py: 0 }}>
                            <ListItemText
                              primary={req.text}
                              primaryTypographyProps={{
                                variant: 'caption',
                                color: req.regex.test(passwordData.newPassword) ? 'success.main' : 'text.secondary',
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        margin="normal"
                        InputProps={{
                          startAdornment: <VerifiedUser sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                        helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Passwords do not match' : ''}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={handlePasswordChangeSubmit}
                          disabled={
                            loading.password ||
                            !passwordData.currentPassword ||
                            !passwordData.newPassword ||
                            passwordData.newPassword !== passwordData.confirmPassword ||
                            loading.imageUpload
                          }
                          startIcon={<Save />}
                        >
                          {loading.password ? <CircularProgress size={24} /> : 'Update Password'}
                        </Button>
                      </Box>
                      
                      {error.password && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          Failed to update password. Please check your current password and try again.
                        </Alert>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </ErrorBoundary>
          </Grid>

          {/* Activity Column */}
          <Grid item xs={12} md={6}>
            <ErrorBoundary fallback={<Alert severity="error">Activity section failed to load</Alert>}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <History sx={{ mr: 1 }} />
                      Recent Activity
                    </Typography>
                    <Chip 
                      label={`${activityLog.length} activities`} 
                      size="small" 
                      color="primary"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {error.activity ? (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      Failed to load activity log. <Button onClick={fetchActivityLog}>Retry</Button>
                    </Alert>
                  ) : loading.activity ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : activityLog.length > 0 ? (
                    <ActivityTimeline activities={activityLog} />
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No recent activity found
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/activity-log')}
                      disabled={activityLog.length === 0}
                    >
                      View Full Activity Log
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </ErrorBoundary>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;