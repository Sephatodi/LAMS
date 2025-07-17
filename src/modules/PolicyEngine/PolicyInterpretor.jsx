// /src/modules/policyEngine/PolicyInterpreter.jsx
import {
  History as HistoryIcon,
  Gavel as LawIcon,
  Article as PolicyIcon,
  Code as RuleIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { useGetPoliciesQuery, useParsePolicyMutation } from '../../api/policyApi';

const PolicyInterpreter = () => {
  const { data: policies = [], isLoading } = useGetPoliciesQuery();
  const [parsePolicy, { data: parsedRules, isLoading: isParsing }] = useParsePolicyMutation();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Parse policy text into system rules
  const handleParsePolicy = (policyId) => {
    const policy = policies.find(p => p.id === policyId);
    if (policy) {
      parsePolicy({ 
        policyText: policy.content,
        effectiveDate: policy.effectiveDate 
      });
      setSelectedPolicy(policy);
    }
  };

  // Filter policies by search term
  const filteredPolicies = policies.filter(policy => 
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <LawIcon sx={{ mr: 1 }} /> Policy Interpretation Engine
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search policies..."
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Active Policies" icon={<PolicyIcon />} />
        <Tab label="Historical Versions" icon={<HistoryIcon />} />
        <Tab label="System Rules" icon={<RuleIcon />} />
      </Tabs>

      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100% - 150px)' }}>
        {/* Policy List */}
        <Card sx={{ width: '40%', overflow: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {activeTab === 0 ? 'Active Policies' : activeTab === 1 ? 'Historical Versions' : 'System Rules'}
            </Typography>
            <List dense>
              {(activeTab === 2 ? (parsedRules || []) : filteredPolicies)
                .filter(p => activeTab !== 1 || p.status === 'historical')
                .map((policy) => (
                  <ListItem 
                    key={policy.id} 
                    button
                    selected={selectedPolicy?.id === policy.id}
                    onClick={() => activeTab !== 2 ? handleParsePolicy(policy.id) : null}
                  >
                    <ListItemText
                      primary={policy.title}
                      secondary={
                        activeTab === 2 ? 
                        `Rule Type: ${policy.ruleType}` : 
                        `Effective: ${new Date(policy.effectiveDate).toLocaleDateString()}`
                      }
                    />
                    {activeTab === 0 && (
                      <Chip 
                        label={policy.status} 
                        size="small"
                        color={policy.status === 'active' ? 'success' : 'default'}
                      />
                    )}
                  </ListItem>
                ))}
            </List>
          </CardContent>
        </Card>

        {/* Policy Details */}
        <Card sx={{ flex: 1, overflow: 'auto' }}>
          <CardContent>
            {selectedPolicy || (parsedRules && parsedRules.length > 0) ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {activeTab === 2 ? 'System Rules' : selectedPolicy.title}
                </Typography>
                <Chip 
                  label={activeTab === 2 ? 'Generated Rule' : selectedPolicy.status} 
                  color="primary" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                
                {activeTab === 2 ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Rule Logic:
                    </Typography>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '4px',
                      overflowX: 'auto'
                    }}>
                      {JSON.stringify(parsedRules, null, 2)}
                    </pre>
                    <Typography variant="caption" color="text.secondary">
                      These rules will be automatically enforced in the system
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Policy Text:
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: '#f9f9f9', 
                      p: 2, 
                      borderRadius: 1,
                      mb: 2
                    }}>
                      {selectedPolicy.content}
                    </Box>
                    <Button 
                      variant="contained" 
                      onClick={() => handleParsePolicy(selectedPolicy.id)}
                      disabled={isParsing}
                    >
                      {isParsing ? 'Parsing...' : 'Generate System Rules'}
                    </Button>
                  </>
                )}
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: 200,
                color: 'text.secondary'
              }}>
                <PolicyIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography>Select a policy to view details</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
};

export default PolicyInterpreter;