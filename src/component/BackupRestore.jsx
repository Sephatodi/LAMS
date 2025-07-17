/** @jsxRuntime classic */
/** @jsx React.createElement */

// src/components/BackupRestore.js
import {
    Backup,
    CloudDownload,
    CloudUpload,
    Edit,
    Security as EncryptionIcon,
    History,
    Description as LogsIcon,
    Restore,
    Schedule,
    Verified as VerificationIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    Snackbar,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const BackupRestore = () => {
  const { currentUser } = useAuth();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmText, setConfirmText] = useState('');
  const [encryptBackup, setEncryptBackup] = useState(true);
  const [verifyBackup, setVerifyBackup] = useState(true);
  const [restoreScope, setRestoreScope] = useState('full');
  const [schedule, setSchedule] = useState({
    frequency: 'daily',
    time: '02:00',
    retention: '30'
  });
  const [verifyingBackupId, setVerifyingBackupId] = useState(null);

  // Check permissions safely
  const hasPermission = useEffect((permission) => {
    return currentUser?.permissions?.includes(permission) || false;
  });

  // Fetch backups on mount
  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const response = await axios.get('/api/backups', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setBackups(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch backups');
        showSnackbar(err.response?.data?.message || 'Failed to fetch backups', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (hasPermission('view_backups')) {
      fetchBackups();
    }
  }, [currentUser, hasPermission]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleStartBackup = async () => {
    if (!hasPermission('create_backup')) {
      showSnackbar('You do not have permission to create backups', 'error');
      return;
    }

    setIsBackingUp(true);
    setBackupProgress(0);
    
    try {
      const response = await axios.post('/api/backups', {
        encrypt: encryptBackup,
        verify: verifyBackup
      }, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setBackupProgress(percentCompleted);
        }
      });

      setBackups([response.data, ...backups]);
      showSnackbar('Backup completed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Backup failed');
      showSnackbar(err.response?.data?.message || 'Backup failed', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!hasPermission('restore_backup')) {
      showSnackbar('You do not have permission to restore backups', 'error');
      return;
    }

    if (confirmText !== 'CONFIRM') {
      showSnackbar('Please type "CONFIRM" to proceed', 'error');
      return;
    }

    try {
      await axios.post(`/api/backups/${selectedBackup.id}/restore`, {
        scope: restoreScope
      }, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });

      showSnackbar('Restore initiated successfully!');
      setRestoreDialog(false);
      setConfirmText('');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Restore failed', 'error');
    }
  };

  const handleSaveSchedule = async () => {
    if (!hasPermission('configure_backup')) {
      showSnackbar('You do not have permission to configure backup schedule', 'error');
      return;
    }

    try {
      await axios.put('/api/backups/schedule', schedule, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      showSnackbar('Backup schedule updated successfully!');
      setScheduleDialog(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to update schedule', 'error');
    }
  };

  const verifyBackupIntegrity = async (backupId) => {
    if (!hasPermission('verify_backup')) {
      showSnackbar('You do not have permission to verify backups', 'error');
      return;
    }

    setVerifyingBackupId(backupId);
    try {
      const response = await axios.get(`/api/backups/${backupId}/verify`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      showSnackbar(response.data.message);
      
      // Update the backup verification status in state
      setBackups(backups.map(backup => 
        backup.id === backupId ? { ...backup, verified: true } : backup
      ));
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setVerifyingBackupId(null);
    }
  };

  // Render permission-based tooltip
  const PermissionTooltip = ({ children, permission }) => {
    if (hasPermission(permission)) {
      return children;
    }
    return (
      <Tooltip title={`You don't have permission to ${permission.split('_').join(' ')}`}>
        <span>{children}</span>
      </Tooltip>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Backup sx={{ mr: 1, verticalAlign: 'middle' }} />
          Backup & Restore
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Create Backup
                </Typography>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  Create a secure backup of all system data including land records, applications, and user accounts.
                </Typography>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={encryptBackup}
                      onChange={(e) => setEncryptBackup(e.target.checked)}
                      icon={<EncryptionIcon />}
                    />
                  }
                  label="Encrypt Backup"
                  sx={{ mr: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={verifyBackup}
                      onChange={(e) => setVerifyBackup(e.target.checked)}
                      icon={<VerificationIcon />}
                    />
                  }
                  label="Verify After Backup"
                />
                
                {isBackingUp ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Backup in progress...
                    </Typography>
                    <LinearProgress variant="determinate" value={backupProgress} />
                    <Typography variant="caption" display="block" textAlign="right">
                      {backupProgress}% complete
                    </Typography>
                  </Box>
                ) : (
                  <PermissionTooltip permission="create_backup">
                    <Button
                      variant="contained"
                      startIcon={<Backup />}
                      onClick={handleStartBackup}
                      sx={{ mt: 2 }}
                      fullWidth
                      disabled={!hasPermission('create_backup')}
                    >
                      Start Secure Backup
                    </Button>
                  </PermissionTooltip>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" gutterBottom>
                    <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Backup Schedule
                  </Typography>
                  <PermissionTooltip permission="configure_backup">
                    <Button 
                      size="small" 
                      startIcon={<Edit />}
                      onClick={() => setScheduleDialog(true)}
                      disabled={!hasPermission('configure_backup')}
                    >
                      Configure
                    </Button>
                  </PermissionTooltip>
                </Box>
                
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Automated Backups" 
                      secondary={`Runs ${schedule.frequency} at ${schedule.time}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Retention Policy" 
                      secondary={`Keep last ${schedule.retention} backups`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Storage Location" 
                      secondary="Secure Botswana Government Cloud (AES-256 encrypted)" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CloudDownload sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Available Backups
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : backups.length === 0 ? (
                  <Typography variant="body1" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                    No backups available
                  </Typography>
                ) : (
                  <List>
                    {backups.map((backup) => (
                      <ListItem 
                        key={backup.id}
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <PermissionTooltip permission="verify_backup">
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={
                                  verifyingBackupId === backup.id ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <VerificationIcon />
                                  )
                                }
                                onClick={() => verifyBackupIntegrity(backup.id)}
                                disabled={
                                  !hasPermission('verify_backup') || 
                                  verifyingBackupId === backup.id
                                }
                              >
                                Verify
                              </Button>
                            </PermissionTooltip>
                            <PermissionTooltip permission="restore_backup">
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Restore />}
                                onClick={() => {
                                  setSelectedBackup(backup);
                                  setRestoreDialog(true);
                                }}
                                disabled={!hasPermission('restore_backup')}
                              >
                                Restore
                              </Button>
                            </PermissionTooltip>
                          </Box>
                        }
                      >
                        <ListItemIcon>
                          <History />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{`${backup.type.toUpperCase()} Backup - ${new Date(backup.date).toLocaleString()}`}</span>
                              {backup.verified && (
                                <Chip 
                                  icon={<VerificationIcon fontSize="small" />}
                                  label="Verified"
                                  size="small"
                                  color="success"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <span>Size: {backup.size}</span>
                              <span>Status: {backup.status}</span>
                              {backup.encrypted && <span>Encrypted: Yes</span>}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Restore Dialog */}
        <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            <Restore sx={{ mr: 1, verticalAlign: 'middle' }} />
            Restore From Backup
          </DialogTitle>
          <DialogContent dividers>
            {selectedBackup && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  You are about to restore the system from:
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {selectedBackup.type.toUpperCase()} Backup - {new Date(selectedBackup.date).toLocaleString()}
                </Typography>
                
                <Alert severity="error" sx={{ my: 2 }}>
                  <strong>Warning:</strong> This will overwrite all current data with the data from this backup point.
                  This action cannot be undone.
                </Alert>
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Restore Scope</InputLabel>
                  <Select
                    value={restoreScope}
                    onChange={(e) => setRestoreScope(e.target.value)}
                    label="Restore Scope"
                  >
                    <MenuItem value="full">Full System (All Data)</MenuItem>
                    <MenuItem value="land-records">Land Records Only</MenuItem>
                    <MenuItem value="applications">Applications Only</MenuItem>
                    <MenuItem value="user-data">User Accounts Only</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Restore Confirmation"
                  placeholder="Type 'CONFIRM' to proceed"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  sx={{ mt: 3 }}
                  helperText="This action cannot be undone. Please be certain before proceeding."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setRestoreDialog(false);
              setConfirmText('');
            }}>
              Cancel
            </Button>
            <PermissionTooltip permission="restore_backup">
              <Button 
                variant="contained" 
                color="error"
                onClick={handleRestore}
                disabled={confirmText !== 'CONFIRM' || !hasPermission('restore_backup')}
              >
                Confirm Restore
              </Button>
            </PermissionTooltip>
          </DialogActions>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
            Configure Backup Schedule
          </DialogTitle>
          <DialogContent dividers>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={schedule.frequency}
                onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}
                label="Frequency"
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Time of Day"
              type="time"
              value={schedule.time}
              onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Retention Policy</InputLabel>
              <Select
                value={schedule.retention}
                onChange={(e) => setSchedule({ ...schedule, retention: e.target.value })}
                label="Retention Policy"
              >
                <MenuItem value="7">Keep last 7 backups</MenuItem>
                <MenuItem value="30">Keep last 30 backups</MenuItem>
                <MenuItem value="90">Keep last 90 backups</MenuItem>
                <MenuItem value="0">Keep all backups</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={encryptBackup}
                  onChange={(e) => setEncryptBackup(e.target.checked)}
                  icon={<EncryptionIcon />}
                />
              }
              label="Encrypt Automated Backups"
              sx={{ mt: 2 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={verifyBackup}
                  onChange={(e) => setVerifyBackup(e.target.checked)}
                  icon={<VerificationIcon />}
                />
              }
              label="Verify After Automated Backup"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
            <PermissionTooltip permission="configure_backup">
              <Button 
                variant="contained" 
                onClick={handleSaveSchedule}
                disabled={!hasPermission('configure_backup')}
              >
                Save Schedule
              </Button>
            </PermissionTooltip>
          </DialogActions>
        </Dialog>

        {/* Logs Section */}
        {hasPermission('view_backup_logs') && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LogsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Backup Logs
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {backups.length > 0 ? (
                  <List dense>
                    {backups.slice(0, 10).map((backup) => (
                      <ListItem key={`log-${backup.id}`}>
                        <ListItemText
                          primary={`${new Date(backup.date).toLocaleString()} - ${backup.type.toUpperCase()} Backup`}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <span>Status: {backup.status}</span>
                              <span>Initiated by: {backup.initiatedBy || 'System'}</span>
                              {backup.notes && <span>Notes: {backup.notes}</span>}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                    No backup logs available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BackupRestore;