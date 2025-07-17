import {
    Gavel as CaseIcon,
    Close as CloseIcon,
    CalendarToday as DateIcon,
    Map as MapIcon,
    Person as PersonIcon,
    CheckCircle as ResolvedIcon,
    Warning as SeverityIcon
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    active: theme.palette.error.main,
    resolved: theme.palette.success.main,
    pending: theme.palette.warning.main
  };
  
  return {
    backgroundColor: statusColors[status] || theme.palette.grey[500],
    color: theme.palette.getContrastText(statusColors[status] || theme.palette.grey[500]),
    fontWeight: 'bold'
  };
});

const SeverityChip = styled(Chip)(({ theme, severity }) => {
  const severityColors = {
    high: theme.palette.error.dark,
    medium: theme.palette.warning.dark,
    low: theme.palette.info.dark
  };
  
  return {
    backgroundColor: severityColors[severity] || theme.palette.grey[500],
    color: theme.palette.getContrastText(severityColors[severity] || theme.palette.grey[500]),
    fontWeight: 'bold'
  };
});

const ConflictDetailsPanel = ({ conflict, onClose, onResolve }) => {
  if (!conflict) return null;

  return (
    <Dialog
      open={!!conflict}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            Conflict Case #{conflict.caseNumber}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <StatusChip 
                label={conflict.status.toUpperCase()} 
                status={conflict.status}
                size="medium"
              />
              <SeverityChip
                label={`SEVERITY: ${conflict.severity.toUpperCase()}`}
                severity={conflict.severity}
                size="medium"
                icon={<SeverityIcon fontSize="small" />}
              />
            </Stack>
          </Paper>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              <CaseIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Case Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <DateIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Date Reported"
                  secondary={new Date(conflict.dateReported).toLocaleDateString()}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <MapIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Location"
                  secondary={conflict.location || 'Not specified'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Description"
                  secondary={conflict.description || 'No description provided'}
                  secondaryTypographyProps={{ whiteSpace: 'pre-wrap' }}
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              <PersonIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Involved Parties
            </Typography>
            <List dense>
              {conflict.parties.map((party, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'grey.700' }}>
                      {party.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={party}
                    secondary={conflict.roles?.[index] || 'Role not specified'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {conflict.history && conflict.history.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Case History
                </Typography>
                <List dense>
                  {conflict.history.map((event, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={event.action}
                        secondary={`${new Date(event.date).toLocaleDateString()} - ${event.by}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ mr: 1 }}
        >
          Close
        </Button>
        {conflict.status !== 'resolved' && (
          <Button
            variant="contained"
            color="success"
            startIcon={<ResolvedIcon />}
            onClick={() => {
              onResolve();
              onClose();
            }}
          >
            Mark as Resolved
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConflictDetailsPanel;