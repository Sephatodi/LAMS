// /src/components/FinancialAnalytics/CostAnalysis.jsx
import {
  ListAlt as BreakdownIcon,
  Compare as CompareIcon,
  PieChart as CostIcon
} from '@mui/icons-material';
import {
  Box,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetCostAnalysisQuery } from '../../api/financeApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CostAnalysis = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { data: analysis, isLoading } = useGetCostAnalysisQuery();

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <CostIcon sx={{ mr: 1 }} /> Service Cost Analysis
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Cost Breakdown" icon={<BreakdownIcon />} />
        <Tab label="Year Comparison" icon={<CompareIcon />} />
      </Tabs>

      {isLoading ? (
        <LinearProgress />
      ) : activeTab === 0 ? (
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Cost Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysis?.costDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analysis?.costDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`BWP ${value.toLocaleString()}`]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Cost Drivers
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {analysis?.costDrivers?.map((driver, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={driver.name}
                      secondary={`BWP ${driver.cost.toLocaleString()} (${driver.percentage}% of total)`}
                    />
                    <Chip 
                      label={driver.trend >= 0 ? `+${driver.trend}%` : `${driver.trend}%`}
                      color={driver.trend >= 0 ? 'error' : 'success'}
                      size="small"
                    />
                  </ListItem>
                  {index < analysis.costDrivers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Year-over-Year Cost Comparison
          </Typography>
          <Box sx={{ height: 400 }}>
            {/* Would implement a comparative chart here */}
            <Typography>Year comparison chart would be displayed here</Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default CostAnalysis;