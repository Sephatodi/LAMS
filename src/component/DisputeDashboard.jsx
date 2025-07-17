/** @jsxRuntime classic */
/** @jsx React.createElement */


// src/features/disputes/DisputeDashboard.js
import { Cancel, CheckCircle, Gavel } from '@mui/icons-material';
import {
    Box, Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel, List, ListItem, ListItemText,
    MenuItem,
    Paper,
    Select,
    Tab,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow,
    Tabs,
    TextField
} from '@mui/material';
import  React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDispute, fetchDisputes, resolveDispute } from '../api/disputeAPI';
import useAuth from '../hooks/useAuth';
import DisputeFormStepper from './DisputeFormStepper';

const DisputeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionData, setResolutionData] = useState({
    type: 'approve',
    notes: '',
    files: []
  });
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    total: 0
  });

  const loadDisputes = useCallback(async () => {
    try {
      const data = await fetchDisputes({
        page: pagination.page,
        size: pagination.pageSize
      });
      setDisputes(data.items);
      setPagination(prev => ({ ...prev, total: data.total }));
    } catch (error) {
      console.error('Error loading disputes:', error);
    }
  }, [pagination.page, pagination.pageSize]);

  useEffect(() => {
    loadDisputes();
    
    // WebSocket for real-time updates
    const ws = new WebSocket('wss://api.yourservice.com/disputes/updates');
    ws.onmessage = (event) => {
      const updatedDispute = JSON.parse(event.data);
      setDisputes(prev => prev.map(d => 
        d.id === updatedDispute.id ? updatedDispute : d
      ));
    };
    
    return () => ws.close();
  }, [loadDisputes]);

  const handleResolve = async () => {
    try {
      await resolveDispute(selectedDispute.id, resolutionData);
      setDisputes(prev => prev.map(d => 
        d.id === selectedDispute.id ? { ...d, status: 'resolved' } : d
      ));
      setSelectedDispute(null);
    } catch (error) {
      console.error('Resolution failed:', error);
    }
  };

  const handleCreateDispute = async (disputeData) => {
    try {
      const response = await createDispute(disputeData);
      navigate('/disputes', { 
        state: { 
          success: `Dispute submitted successfully! Case #${response.caseNumber}` 
        } 
      });
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const AuditHistory = ({ disputeId }) => {
    const [history, setHistory] = useState([]);
  
    useEffect(() => {
      const loadHistory = async () => {
        try {
          const response = await fetch(`/api/disputes/${disputeId}/history`);
          setHistory(await response.json());
        } catch (error) {
          console.error('Error loading history:', error);
        }
      };
      loadHistory();
    }, [disputeId]);
  
    return (
      <List dense>
        {history.map(record => (
          <ListItem key={record.timestamp}>
            <ListItemText
              primary={record.action}
              secondary={`By ${record.user} at ${new Date(record.timestamp).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Active Disputes" />
          <Tab label="File New Dispute" />
        </Tabs>

        {activeTab === 0 ? (
          <>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Parcel ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date Filed</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {disputes.map(dispute => (
                    <TableRow key={dispute.id}>
                      <TableCell>{dispute.parcelId}</TableCell>
                      <TableCell>{dispute.type}</TableCell>
                      <TableCell>
                        <Chip 
                          label={dispute.status} 
                          color={dispute.status === 'resolved' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => setSelectedDispute(dispute)}
                          disabled={user?.role !== 'admin'}
                        >
                          Resolve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedDispute && (
              <Dialog
                open={!!selectedDispute}
                onClose={() => setSelectedDispute(null)}
                fullWidth
                maxWidth="md"
              >
                <DialogTitle>
                  <Gavel sx={{ mr: 1 }} />
                  Resolve Dispute: {selectedDispute.parcelId}
                </DialogTitle>
                <DialogContent>
                  <FormControl fullWidth sx={{ my: 2 }}>
                    <InputLabel>Resolution Type</InputLabel>
                    <Select
                      value={resolutionData.type}
                      onChange={e => setResolutionData({ 
                        ...resolutionData, 
                        type: e.target.value 
                      })}
                      label="Resolution Type"
                    >
                      <MenuItem value="approve">Approve Allocation</MenuItem>
                      <MenuItem value="revoke">Revoke Allocation</MenuItem>
                      <MenuItem value="modify">Modify Boundaries</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Resolution Notes"
                    multiline
                    rows={4}
                    fullWidth
                    value={resolutionData.notes}
                    onChange={e => setResolutionData({ 
                      ...resolutionData, 
                      notes: e.target.value 
                    })}
                    sx={{ mb: 2 }}
                  />

                  <AuditHistory disputeId={selectedDispute.id} />
                </DialogContent>
                <DialogActions>
                  <Button 
                    startIcon={<Cancel />}
                    onClick={() => setSelectedDispute(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    startIcon={<CheckCircle />}
                    onClick={handleResolve}
                    variant="contained"
                    color="primary"
                  >
                    Submit Resolution
                  </Button>
                </DialogActions>
              </Dialog>
            )}
          </>
        ) : (
          <DisputeFormStepper
            steps={['Parcel Details', 'Upload Evidence', 'Review']}
            onSubmit={handleCreateDispute}
          />
        )}
      </Box>
    </Container>
  );
};

export default DisputeDashboard;