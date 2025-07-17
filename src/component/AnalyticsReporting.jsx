/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    BarChart as BarChartIcon,
    MonetizationOn as MonetizationOnIcon
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Chip,
    Container,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Typography
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers';
import axios from "axios";
import { useEffect, useState } from "react";
import { PuffLoader } from 'react-spinners';
import {
    Bar,
    BarChart,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import useApi from '../hooks/useApi';

const AnalyticsReporting = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [delinquentAccounts, setDelinquentAccounts] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    end: new Date()
  });
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch general analytics
        const analyticsResponse = await axios.get("/api/analytics");
        setAnalyticsData(analyticsResponse.data);
        
        // Fetch payment data
        const paymentResponse = await api.get('/payments/analytics', {
          params: {
            start: dateRange.start.toISOString(),
            end: dateRange.end.toISOString()
          }
        });
        setPaymentData(paymentResponse.data.payments);
        setDelinquentAccounts(paymentResponse.data.delinquentAccounts);
        
      } catch (error) {
        setError("Error fetching analytics data. Please try again later.");
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [api, dateRange]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 5 }}>
        <PuffLoader />
        <Typography>Loading analytics data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <BarChartIcon sx={{ mr: 2, fontSize: 40 }} />
        <Typography variant="h4">Analytics & Reporting</Typography>
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 4 }}
      >
        <Tab label="General Analytics" value="general" />
        <Tab label="Payment Analytics" value="payments" icon={<MonetizationOnIcon />} />
        <Tab label="Delinquent Accounts" value="delinquent" />
      </Tabs>

      {activeTab === 'general' && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analyticsData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {activeTab === 'payments' && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <DatePicker
              label="Start Date"
              value={dateRange.start}
              onChange={(date) => setDateRange({...dateRange, start: date})}
            />
            <DatePicker
              label="End Date"
              value={dateRange.end}
              onChange={(date) => setDateRange({...dateRange, end: date})}
            />
          </Box>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={paymentData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="collected" fill="#4caf50" name="Collected" />
              <Bar dataKey="outstanding" fill="#f44336" name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      {activeTab === 'delinquent' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Amount Due</TableCell>
                <TableCell>Days Overdue</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {delinquentAccounts.map(account => (
                <TableRow key={account.id}>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>BWP {account.amountDue.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={account.daysOverdue} 
                      color={
                        account.daysOverdue > 90 ? 'error' : 
                        account.daysOverdue > 30 ? 'warning' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="contained">Send Reminder</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AnalyticsReporting;