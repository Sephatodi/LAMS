// /src/components/RiskDashboard/RegulatoryChangeMonitor.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText,
  Chip,
  Divider,
  Button,
  TextField,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Announcement as BulletinIcon,
  Gavel as LawIcon,
  Warning as AlertIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Notifications as SubscribeIcon
} from '@mui/icons-material';
import { useGetRegulatoryChangesQuery, useSubscribeToChangesMutation } from '../../api/policyApi';

const RegulatoryChangeMonitor = () => {
  const { data: changes = [], isLoading } = useGetRegulatoryChangesQuery();
  const [subscribe] = useSubscribeToChangesMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    urgency: 'all',
    category: 'all'
  });

  const filteredChanges = changes
    .filter(change => 
      change.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(change => 
      filters.urgency === 'all' || change.urgency === filters.urgency
    )
    .filter(change =>
      filters.category === 'all' || change.category === filters.category
    )
    .filter(change =>
      activeTab === 0 ? change.status === 'active' :
      activeTab === 1 ? change.status === 'pending' :
      change.status === 'archived'
    );

  const handleSubscribe = async (changeId) => {
    try {
      await subscribe(changeId).unwrap();
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <BulletinIcon sx={{ mr: 1 }} /> Regulatory Change Monitor
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search regulatory changes..."
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
        >
          Filters
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Active Changes" />
        <Tab label="Pending Implementation" />
        <Tab label="Archived" />
      </Tabs>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredChanges.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 200,
          color: 'text.secondary'
        }}>
          <AlertIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography>No regulatory changes found</Typography>
          <Typography variant="caption">Adjust your filters or search term</Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 150px)', overflow: 'auto' }}>
          {filteredChanges.map((change, index) => (
            <React.Fragment key={change.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LawIcon color="action" sx={{ mr: 1 }} />
                      {change.title}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {change.description}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        Effective: {new Date(change.effectiveDate).toLocaleDateString()} • 
                        Category: {change.category} • 
                        Source: {change.source}
                      </Typography>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Chip 
                    label={change.urgency} 
                    size="small" 
                    color={getUrgencyColor(change.urgency)}
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SubscribeIcon />}
                    onClick={() => handleSubscribe(change.id)}
                  >
                    Subscribe
                  </Button>
                </Box>
              </ListItem>
              {index < filteredChanges.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default RegulatoryChangeMonitor;