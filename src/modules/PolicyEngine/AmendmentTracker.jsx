// /src/modules/policyEngine/AmendmentTracker.jsx
import {
  Add as AddIcon,
  Close as CloseIcon,
  Compare as CompareIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import { useGetPolicyVersionsQuery } from '../../api/policyApi';

const AmendmentTracker = ({ policyId }) => {
  const { data: versions = [], isLoading } = useGetPolicyVersionsQuery(policyId);
  const [activeTab, setActiveTab] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [version1, setVersion1] = useState(null);
  const [version2, setVersion2] = useState(null);
  const [openAddNote, setOpenAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleCompare = () => {
    if (version1 && version2) {
      setCompareMode(true);
    }
  };

  const resetComparison = () => {
    setCompareMode(false);
    setVersion1(null);
    setVersion2(null);
  };

  const handleAddNote = () => {
    // In a real app, would save the note to the backend
    setOpenAddNote(false);
    setNoteText('');
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <HistoryIcon sx={{ mr: 1 }} /> Policy Amendment Tracker
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Version History" />
        <Tab label="Comparison Tool" />
        <Tab label="Amendment Log" />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Policy Version History
            </Typography>
            <List dense>
              {versions.map((version, index) => (
                <React.Fragment key={version.id}>
                  <ListItem>
                    <ListItemText
                      primary={`Version ${version.versionNumber}`}
                      secondary={
                        <>
                          Effective: {new Date(version.effectiveDate).toLocaleDateString()}
                          {version.endDate && ` - ${new Date(version.endDate).toLocaleDateString()}`}
                        </>
                      }
                    />
                    <Chip 
                      label={version.status} 
                      size="small"
                      color={
                        version.status === 'current' ? 'success' :
                        version.status === 'draft' ? 'warning' : 'default'
                      }
                    />
                  </ListItem>
                  {index < versions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Box>
          {!compareMode ? (
            <>
              <Typography variant="body1" gutterBottom>
                Select two versions to compare:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Version 1</InputLabel>
                  <Select
                    value={version1 || ''}
                    onChange={(e) => setVersion1(e.target.value)}
                    label="Version 1"
                  >
                    {versions.map(version => (
                      <MenuItem key={version.id} value={version.id}>
                        Version {version.versionNumber} ({new Date(version.effectiveDate).toLocaleDateString()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Version 2</InputLabel>
                  <Select
                    value={version2 || ''}
                    onChange={(e) => setVersion2(e.target.value)}
                    label="Version 2"
                  >
                    {versions.map(version => (
                      <MenuItem key={version.id} value={version.id}>
                        Version {version.versionNumber} ({new Date(version.effectiveDate).toLocaleDateString()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Button
                variant="contained"
                startIcon={<CompareIcon />}
                onClick={handleCompare}
                disabled={!version1 || !version2}
              >
                Compare Versions
              </Button>
            </>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Comparing Policy Versions
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<CloseIcon />}
                  onClick={resetComparison}
                >
                  Exit Comparison
                </Button>
              </Box>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: 3,
                height: '500px',
                overflow: 'auto'
              }}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Version {versions.find(v => v.id === version1)?.versionNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Effective: {new Date(versions.find(v => v.id === version1)?.effectiveDate).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ 
                      mt: 2,
                      p: 2,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 1,
                      height: '400px',
                      overflow: 'auto'
                    }}>
                      {versions.find(v => v.id === version1)?.content}
                    </Box>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Version {versions.find(v => v.id === version2)?.versionNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Effective: {new Date(versions.find(v => v.id === version2)?.effectiveDate).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ 
                      mt: 2,
                      p: 2,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 1,
                      height: '400px',
                      overflow: 'auto'
                    }}>
                      {versions.find(v => v.id === version2)?.content}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f7ff', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Summary of Changes
                </Typography>
                <Typography variant="body2">
                  {/* In a real app, would use a diff algorithm to highlight changes */}
                  {versions.find(v => v.id === version1)?.changeSummary || 'No change summary available'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenAddNote(true)}
            >
              Add Amendment Note
            </Button>
          </Box>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Amendment History Log
              </Typography>
              <List dense>
                {versions.flatMap(version => version.amendments || []).map((amendment, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={amendment.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {amendment.description}
                            </Typography>
                            <br />
                            <Typography component="span" variant="caption">
                              {new Date(amendment.date).toLocaleDateString()} • {amendment.author}
                            </Typography>
                          </>
                        }
                      />
                      <Chip 
                        label={`v${amendment.versionNumber}`} 
                        size="small" 
                        variant="outlined"
                      />
                    </ListItem>
                    {index < versions.flatMap(v => v.amendments || []).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Add Amendment Note Dialog */}
      <Dialog open={openAddNote} onClose={() => setOpenAddNote(false)}>
        <DialogTitle>Add Amendment Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Related Version"
            fullWidth
            variant="standard"
            select
          >
            {versions.map(version => (
              <MenuItem key={version.id} value={version.id}>
                Version {version.versionNumber}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddNote(false)}>Cancel</Button>
          <Button onClick={handleAddNote}>Save Note</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AmendmentTracker;