// /src/modules/finance/DebtManagement.jsx
import {
    MoneyOff as DebtIcon,
    FilterAlt as FilterIcon,
    Gavel as LegalIcon,
    Send as SendIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
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
import { useGetDebtsQuery, useSendReminderMutation } from '../../api/financeApi';

const DebtManagement = () => {
  const { data: debts = [], isLoading } = useGetDebtsQuery();
  const [sendReminder] = useSendReminderMutation();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');

  const filteredDebts = debts
    .filter(debt => 
      activeTab === 0 ? true :
      activeTab === 1 ? debt.status === 'active' :
      debt.status === 'resolved'
    )
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

  const handleSendReminder = async () => {
    if (selectedDebt) {
      try {
        await sendReminder({
          debtId: selectedDebt.id,
          message: reminderMessage || 'Gentle reminder about your overdue payment'
        }).unwrap();
        setReminderDialogOpen(false);
        setSelectedDebt(null);
        setReminderMessage('');
      } catch (error) {
        console.error('Failed to send reminder:', error);
      }
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <DebtIcon sx={{ mr: 1 }} /> Debt Management System
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="All Debts" />
          <Tab label="Active" />
          <Tab label="Resolved" />
        </Tabs>
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
        >
          Filter
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 100px)', overflow: 'auto' }}>
          {filteredDebts.map((debt, index) => (
            <React.Fragment key={debt.id}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SendIcon />}
                      onClick={() => {
                        setSelectedDebt(debt);
                        setReminderDialogOpen(true);
                      }}
                    >
                      Remind
                    </Button>
                    {debt.daysOverdue > 60 && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<LegalIcon />}
                      >
                        Escalate
                      </Button>
                    )}
                  </Box>
                }
              >
                <ListItemText
                  primary={`${debt.tenantName} - Invoice ${debt.invoiceNumber}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        BWP {debt.amount.toFixed(2)} • Due {new Date(debt.dueDate).toLocaleDateString()}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        {debt.daysOverdue} days overdue • {debt.remindersSent} reminders sent
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < filteredDebts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Reminder Dialog */}
      <Dialog 
        open={reminderDialogOpen} 
        onClose={() => setReminderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send Payment Reminder
          {selectedDebt && ` to ${selectedDebt.tenantName}`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Invoice: {selectedDebt?.invoiceNumber} • Amount: BWP {selectedDebt?.amount.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedDebt?.daysOverdue} days overdue
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Reminder Message"
            value={reminderMessage}
            onChange={(e) => setReminderMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            This message will be sent via email and SMS to the tenant
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<SendIcon />}
            onClick={handleSendReminder}
          >
            Send Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DebtManagement;