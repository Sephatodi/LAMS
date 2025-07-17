// /src/modules/finance/PaymentTracker.jsx
import {
    Warning as OverdueIcon,
    CheckCircle as PaidIcon,
    Payments as PaymentIcon,
    Pending as PendingIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import {
    Box,
    Card,
    Chip,
    Divider,
    InputAdornment,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useGetPaymentsQuery } from '../../api/financeApi';

const PaymentTracker = () => {
  const { data: payments = [], isLoading } = useGetPaymentsQuery();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments
    .filter(payment => 
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(payment => 
      activeTab === 0 ? true :
      activeTab === 1 ? payment.status === 'paid' :
      activeTab === 2 ? payment.status === 'pending' :
      payment.status === 'overdue'
    );

  const summary = payments.reduce((acc, payment) => {
    acc.totalInvoiced += payment.amount;
    if (payment.status === 'paid') acc.totalPaid += payment.amount;
    if (payment.status === 'overdue') acc.totalOverdue += payment.amount;
    return acc;
  }, { totalInvoiced: 0, totalPaid: 0, totalOverdue: 0 });

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PaymentIcon sx={{ mr: 1 }} /> Payment Tracking System
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Card sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Invoiced
          </Typography>
          <Typography variant="h4">
            BWP {summary.totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Card>
        <Card sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Collected
          </Typography>
          <Typography variant="h4" color="success.main">
            BWP {summary.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Card>
        <Card sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Overdue
          </Typography>
          <Typography variant="h4" color="error.main">
            BWP {summary.totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search payments..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="All" />
          <Tab label="Paid" icon={<PaidIcon />} />
          <Tab label="Pending" icon={<PendingIcon />} />
          <Tab label="Overdue" icon={<OverdueIcon />} />
        </Tabs>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 200px)', overflow: 'auto' }}>
          {filteredPayments.map((payment, index) => (
            <React.Fragment key={payment.id}>
              <ListItem>
                <ListItemText
                  primary={`Invoice ${payment.invoiceNumber} - ${payment.tenantName}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {payment.description}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        Due: {new Date(payment.dueDate).toLocaleDateString()} • 
                        {payment.paymentDate && ` Paid: ${new Date(payment.paymentDate).toLocaleDateString()}`}
                      </Typography>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography variant="body1" fontWeight="bold">
                    BWP {payment.amount.toFixed(2)}
                  </Typography>
                  <Chip 
                    label={payment.status} 
                    size="small"
                    color={
                      payment.status === 'paid' ? 'success' :
                      payment.status === 'overdue' ? 'error' : 'warning'
                    }
                    sx={{ mt: 1 }}
                  />
                </Box>
              </ListItem>
              {index < filteredPayments.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default PaymentTracker;