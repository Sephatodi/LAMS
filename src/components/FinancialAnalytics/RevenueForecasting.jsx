// /src/components/FinancialAnalytics/RevenueForecasting.jsx
import {
    Timeline as ForecastIcon
} from '@mui/icons-material';
import {
    Box,
    Card,
    FormControl,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGetRevenueForecastQuery } from '../../api/financeApi';

const RevenueForecasting = () => {
  const [timeframe, setTimeframe] = useState('12');
  const [chartData, setChartData] = useState([]);
  const { data: forecast, isLoading } = useGetRevenueForecastQuery(timeframe);

  useEffect(() => {
    if (forecast) {
      const data = forecast.monthlyProjections.map(proj => ({
        name: proj.month,
        projected: proj.projectedRevenue,
        actual: proj.actualRevenue || null,
        leases: proj.activeLeases
      }));
      setChartData(data);
    }
  }, [forecast]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ForecastIcon sx={{ mr: 1 }} /> Revenue Forecasting
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            label="Timeframe"
          >
            <MenuItem value="6">6 Months</MenuItem>
            <MenuItem value="12">12 Months</MenuItem>
            <MenuItem value="24">24 Months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <Card sx={{ p: 2, flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Next Month Projection
              </Typography>
              <Typography variant="h4">
                BWP {forecast?.nextMonth?.projectedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {forecast?.nextMonth?.activeLeases} active leases
              </Typography>
            </Card>
            <Card sx={{ p: 2, flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Current Collection Rate
              </Typography>
              <Typography variant="h4">
                {forecast?.collectionRate?.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {forecast?.paidLeases} of {forecast?.totalLeases} leases paid
              </Typography>
            </Card>
            <Card sx={{ p: 2, flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Annual Projection
              </Typography>
              <Typography variant="h4">
                BWP {forecast?.annualProjection?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ± {forecast?.projectionVariance}% variance
              </Typography>
            </Card>
          </Box>

          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`BWP ${value.toLocaleString()}`, value === 'projected' ? 'Projected' : 'Actual']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                  name="Projected Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Actual Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default RevenueForecasting;