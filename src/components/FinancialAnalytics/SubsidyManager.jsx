// /src/components/FinancialAnalytics/SubsidyManager.jsx
import {
    Add as AddIcon,
    Person as BeneficiaryIcon,
    Paid as PaymentIcon,
    Support as SubsidyIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
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
import { useAddSubsidyMutation, useGetSubsidiesQuery } from '../../api/financeApi';

const SubsidyManager = () => {
  const { data: subsidies = [], isLoading } = useGetSubsidiesQuery();
  const [addSubsidy] = useAddSubsidyMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [newSubsidy, setNewSubsidy] = useState({
    beneficiary: '',
    type: 'residential',
    amount: '',
    duration: '12'
  });

  const handleAddSubsidy = async () => {
    try {
      await addSubsidy({
        ...newSubsidy,
        amount: parseFloat(newSubsidy.amount),
        duration: parseInt(newSubsidy.duration)
      }).unwrap();
      setOpenDialog(false);
      setNewSubsidy({
        beneficiary: '',
        type: 'residential',
        amount: '',
        duration: '12'
      });
    } catch (error) {
      console.error('Failed to add subsidy:', error);
    }
  };

  const totalAnnualCost = subsidies.reduce((sum, subsidy) => {
    return sum + (subsidy.monthlyAmount * subsidy.duration);
  }, 0);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SubsidyIcon sx={{ mr: 1 }} /> Welfare Subsidy Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Card sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Active Subsidies
          </Typography>
          <Typography variant="h4">
            {subsidies.length}
          </Typography>
        </Card>
        <Card sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Annual Cost
          </Typography>
          <Typography variant="h4">
            BWP {totalAnnualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Card>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Subsidy
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 150px)', overflow: 'auto' }}>
          {subsidies.map((subsidy, index) => (
            <React.Fragment key={subsidy.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BeneficiaryIcon color="action" sx={{ mr: 1 }} />
                      {subsidy.beneficiaryName}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        BWP {subsidy.monthlyAmount.toFixed(2)} monthly • {subsidy.duration} months
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        {subsidy.type} • Started: {new Date(subsidy.startDate).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
                <Chip 
                  label={`BWP ${(subsidy.monthlyAmount * subsidy.duration).toFixed(2)} total`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </ListItem>
              {index < subsidies.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Add Subsidy Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Subsidy</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Beneficiary Name"
            fullWidth
            variant="standard"
            value={newSubsidy.beneficiary}
            onChange={(e) => setNewSubsidy({...newSubsidy, beneficiary: e.target.value})}
          />
          <FormControl fullWidth margin="normal" variant="standard">
            <InputLabel>Subsidy Type</InputLabel>
            <Select
              value={newSubsidy.type}
              onChange={(e) => setNewSubsidy({...newSubsidy, type: e.target.value})}
            >
              <MenuItem value="residential">Residential</MenuItem>
              <MenuItem value="agricultural">Agricultural</MenuItem>
              <MenuItem value="small_business">Small Business</MenuItem>
              <MenuItem value="special_needs">Special Needs</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Monthly Amount (BWP)"
            type="number"
            fullWidth
            variant="standard"
            value={newSubsidy.amount}
            onChange={(e) => setNewSubsidy({...newSubsidy, amount: e.target.value})}
          />
          <FormControl fullWidth margin="normal" variant="standard">
            <InputLabel>Duration (months)</InputLabel>
            <Select
              value={newSubsidy.duration}
              onChange={(e) => setNewSubsidy({...newSubsidy, duration: e.target.value})}
            >
              <MenuItem value="6">6 months</MenuItem>
              <MenuItem value="12">12 months</MenuItem>
              <MenuItem value="24">24 months</MenuItem>
              <MenuItem value="36">36 months</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<PaymentIcon />}
            onClick={handleAddSubsidy}
            disabled={!newSubsidy.beneficiary || !newSubsidy.amount}
          >
            Create Subsidy
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SubsidyManager;