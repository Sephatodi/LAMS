// /src/modules/finance/LeaseBilling.jsx
import {
    CalendarToday as CalendarIcon,
    FilterAlt as FilterIcon,
    Receipt as InvoiceIcon,
    AttachMoney as PaymentIcon,
    Send as SendIcon
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
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useGenerateInvoicesMutation, useGetLeasesQuery } from '../../api/financeApi';

const LeaseBilling = () => {
  const { data: leases = [], isLoading } = useGetLeasesQuery();
  const [generateInvoices] = useGenerateInvoicesMutation();
  const [filter, setFilter] = useState('all');
  const [selectedLeases, setSelectedLeases] = useState([]);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredLeases = leases.filter(lease => 
    filter === 'all' || 
    (filter === 'unbilled' && !lease.lastInvoiceDate) ||
    (filter === 'active' && lease.status === 'active')
  );

  const handleGenerateInvoices = async () => {
    try {
      await generateInvoices({
        leaseIds: selectedLeases,
        invoiceDate
      }).unwrap();
      setSelectedLeases([]);
      setInvoiceDialogOpen(false);
    } catch (error) {
      console.error('Invoice generation failed:', error);
    }
  };

  const toggleLeaseSelection = (leaseId) => {
    setSelectedLeases(prev => 
      prev.includes(leaseId) 
        ? prev.filter(id => id !== leaseId) 
        : [...prev, leaseId]
    );
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <InvoiceIcon sx={{ mr: 1 }} /> Lease Billing System
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filter Leases</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter Leases"
            startAdornment={<FilterIcon color="action" />}
          >
            <MenuItem value="all">All Leases</MenuItem>
            <MenuItem value="unbilled">Unbilled Leases</MenuItem>
            <MenuItem value="active">Active Leases</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setInvoiceDialogOpen(true)}
          disabled={selectedLeases.length === 0}
        >
          Generate Invoices ({selectedLeases.length})
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 100px)', overflow: 'auto' }}>
          {filteredLeases.map((lease, index) => (
            <React.Fragment key={lease.id}>
              <ListItem 
                button
                selected={selectedLeases.includes(lease.id)}
                onClick={() => toggleLeaseSelection(lease.id)}
              >
                <ListItemText
                  primary={`Lease ${lease.leaseNumber} - ${lease.tenantName}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {lease.parcelLocation}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        BWP {lease.monthlyRent.toFixed(2)} monthly • 
                        {lease.lastInvoiceDate ? 
                          `Last billed: ${new Date(lease.lastInvoiceDate).toLocaleDateString()}` : 
                          'Never billed'}
                      </Typography>
                    </>
                  }
                />
                <Chip 
                  label={lease.status} 
                  size="small"
                  color={
                    lease.status === 'active' ? 'success' :
                    lease.status === 'terminated' ? 'error' : 'default'
                  }
                  variant="outlined"
                />
              </ListItem>
              {index < filteredLeases.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Invoice Generation Dialog */}
      <Dialog 
        open={invoiceDialogOpen} 
        onClose={() => setInvoiceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Invoices</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You are about to generate invoices for {selectedLeases.length} leases.
          </Typography>
          <TextField
            fullWidth
            label="Invoice Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            sx={{ mt: 2 }}
            InputProps={{
              startAdornment: <CalendarIcon color="action" sx={{ mr: 1 }} />
            }}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Invoices will be generated for the current billing period and sent to tenants
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<PaymentIcon />}
            onClick={handleGenerateInvoices}
          >
            Generate & Send Invoices
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LeaseBilling;