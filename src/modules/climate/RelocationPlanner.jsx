// /src/modules/climate/RelocationPlanner.jsx
import {
    Add as AddIcon,
    Check as ApprovedIcon,
    People as CommunityIcon,
    CalendarToday as DateIcon,
    HomeWork as DestinationIcon,
    Home as OriginIcon,
    Warning as PendingIcon
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
    FormControl,
    InputLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useCreateRelocationPlanMutation, useGetRelocationPlansQuery } from '../../api/climateApi';

const RelocationPlanner = () => {
  const { data: plans = [], isLoading } = useGetRelocationPlansQuery();
  const [createPlan] = useCreateRelocationPlanMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    communityName: '',
    origin: '',
    destination: '',
    households: '',
    timeline: '6'
  });

  const handleCreatePlan = async () => {
    try {
      await createPlan({
        ...newPlan,
        households: parseInt(newPlan.households),
        timeline: parseInt(newPlan.timeline)
      }).unwrap();
      setOpenDialog(false);
      setNewPlan({
        communityName: '',
        origin: '',
        destination: '',
        households: '',
        timeline: '6'
      });
    } catch (error) {
      console.error('Failed to create relocation plan:', error);
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <CommunityIcon sx={{ mr: 1 }} /> Climate Relocation Planning
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Relocation Plan
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 100px)', overflow: 'auto' }}>
          {plans.map((plan, index) => (
            <React.Fragment key={plan.id}>
              <ListItem>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <CommunityIcon />
                </Avatar>
                <ListItemText
                  primary={plan.communityName}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {plan.households} households • {plan.timeline} months
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        From: {plan.origin} • To: {plan.destination}
                      </Typography>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Chip 
                    label={plan.status} 
                    size="small"
                    color={plan.status === 'approved' ? 'success' : 'warning'}
                    icon={plan.status === 'approved' ? <ApprovedIcon /> : <PendingIcon />}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Created: {new Date(plan.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </ListItem>
              {index < plans.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* New Plan Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Relocation Plan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Community Name"
            fullWidth
            variant="standard"
            value={newPlan.communityName}
            onChange={(e) => setNewPlan({...newPlan, communityName: e.target.value})}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Origin Location"
              variant="standard"
              InputProps={{
                startAdornment: <OriginIcon color="action" sx={{ mr: 1 }} />
              }}
              value={newPlan.origin}
              onChange={(e) => setNewPlan({...newPlan, origin: e.target.value})}
            />
            <TextField
              fullWidth
              label="Destination Location"
              variant="standard"
              InputProps={{
                startAdornment: <DestinationIcon color="action" sx={{ mr: 1 }} />
              }}
              value={newPlan.destination}
              onChange={(e) => setNewPlan({...newPlan, destination: e.target.value})}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Number of Households"
              type="number"
              variant="standard"
              value={newPlan.households}
              onChange={(e) => setNewPlan({...newPlan, households: e.target.value})}
            />
            <FormControl fullWidth variant="standard">
              <InputLabel>Timeline (months)</InputLabel>
              <Select
                value={newPlan.timeline}
                onChange={(e) => setNewPlan({...newPlan, timeline: e.target.value})}
                startAdornment={<DateIcon color="action" sx={{ mr: 1 }} />}
              >
                <MenuItem value="3">3 months</MenuItem>
                <MenuItem value="6">6 months</MenuItem>
                <MenuItem value="12">12 months</MenuItem>
                <MenuItem value="24">24 months</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreatePlan}
            disabled={!newPlan.communityName || !newPlan.origin || !newPlan.destination || !newPlan.households}
          >
            Create Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RelocationPlanner;