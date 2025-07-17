import {
    Home as AddressIcon,
    SquareFoot as AreaIcon,
    Close as CloseIcon,
    CalendarToday as DateIcon,
    Description as DetailsIcon,
    Edit as EditIcon,
    History as HistoryIcon,
    Person as OwnerIcon,
    Map as ParcelIcon
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
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    allocated: theme.palette.error.main,
    available: theme.palette.success.main,
    reserved: theme.palette.warning.main,
    government: theme.palette.info.main
  };
  
  return {
    backgroundColor: statusColors[status] || theme.palette.grey[500],
    color: theme.palette.getContrastText(statusColors[status] || theme.palette.grey[500]),
    fontWeight: 'bold'
  };
});

const ParcelDetailsPanel = ({ parcel, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  if (!parcel) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={!!parcel}
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
            Parcel {parcel.parcelNumber}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }}>
        <Tab label="Details" icon={<DetailsIcon fontSize="small" />} />
        <Tab label="History" icon={<HistoryIcon fontSize="small" />} />
      </Tabs>

      <DialogContent dividers>
        {activeTab === 0 ? (
          <Stack spacing={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <StatusChip 
                  label={parcel.status.toUpperCase()} 
                  status={parcel.status}
                  size="medium"
                />
                <Chip
                  label={`AREA: ${parcel.area.toLocaleString()} m²`}
                  color="primary"
                  variant="outlined"
                  size="medium"
                  icon={<AreaIcon fontSize="small" />}
                />
              </Stack>
            </Paper>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                <ParcelIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Parcel Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <DateIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Registration Date"
                    secondary={new Date(parcel.registrationDate).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <AddressIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Location"
                    secondary={parcel.location || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Zoning"
                    secondary={parcel.zoning || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Land Use"
                    secondary={parcel.landUse || 'Not specified'}
                  />
                </ListItem>
              </List>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                <OwnerIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Ownership Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'grey.700' }}>
                      {parcel.owner?.charAt(0)?.toUpperCase() || 'G'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={parcel.owner || 'Government Land'}
                    secondary={parcel.ownerType || 'Not specified'}
                  />
                </ListItem>
                {parcel.ownerId && (
                  <ListItem>
                    <ListItemText
                      primary="Owner ID"
                      secondary={parcel.ownerId}
                    />
                  </ListItem>
                )}
                {parcel.contact && (
                  <ListItem>
                    <ListItemText
                      primary="Contact"
                      secondary={parcel.contact}
                    />
                  </ListItem>
                )}
              </List>
            </Box>

            {parcel.notes && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Additional Notes
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {parcel.notes}
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Parcel History
            </Typography>
            {parcel.history && parcel.history.length > 0 ? (
              <List dense>
                {parcel.history.map((event, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={event.action}
                      secondary={`${new Date(event.date).toLocaleDateString()} - ${event.by}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No history available for this parcel
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ mr: 1 }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => {
            onEdit(parcel);
            onClose();
          }}
        >
          Edit Parcel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParcelDetailsPanel;