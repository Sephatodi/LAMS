 
/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
  AdminPanelSettings,
  Analytics,
  Dashboard,
  GroupWork,
  ListAlt,
  Map,
  People,
  Person,
  Settings
} from "@mui/icons-material";
import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import AdminTools from "../component/AdminTools";
import AllocationTable from "../component/AllocationTable";
import AnalyticsReporting from "../component/AnalyticsReporting";
import AuditLogs from "../component/AuditLogs";
import SystemConfiguration from "../component/SystemConfiguration";
import UserManagement from "../component/UserManagement";
import DepartmentPerformance from "../components/DepartmentPerformance";
import EmployeeMonitoring from "../components/EmployeeMonitoring";
import PerformanceMetrics from "../components/PerformanceMetrics";
import StaffDashboard from "./StaffDashboard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Update URL when tab changes
    switch(newValue) {
      case 0: navigate('system-config'); break;
      case 1: navigate('user-management'); break;
      case 2: navigate('employee-monitoring'); break;
      case 3: navigate('department-performance'); break;
      case 4: navigate('audit-logs'); break;
      case 5: navigate('analytics'); break;
      case 6: navigate('allocation'); break;
      case 7: navigate('admin-tools'); break;
      case 8: navigate('staff-dashboard'); break;
      default: navigate('');
    }
  };

  // Sync tab with current route
  const syncTabWithRoute = () => {
    const path = window.location.pathname;
    if (path.includes('system-config')) setTabValue(0);
    else if (path.includes('user-management')) setTabValue(1);
    else if (path.includes('employee-monitoring')) setTabValue(2);
    else if (path.includes('department-performance')) setTabValue(3);
    else if (path.includes('audit-logs')) setTabValue(4);
    else if (path.includes('analytics')) setTabValue(5);
    else if (path.includes('allocation')) setTabValue(6);
    else if (path.includes('admin-tools')) setTabValue(7);
    else if (path.includes('staff-dashboard')) setTabValue(8);
  };

  useEffect(() => {
    syncTabWithRoute();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            BLBMS Administration Portal
          </Typography>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              mb: 3,
              '& .MuiTab-root': {
                minHeight: 64,
                flexDirection: 'row',
                '& svg': {
                  marginBottom: 0,
                  marginRight: 1
                }
              }
            }}
          >
            <Tab label="System Config" icon={<Settings />} />
            <Tab label="User Management" icon={<People />} />
            <Tab label="Employee Monitoring" icon={<Person />} />
            <Tab label="Department Performance" icon={<GroupWork />} />
            <Tab label="Audit Logs" icon={<ListAlt />} />
            <Tab label="Analytics" icon={<Analytics />} />
            <Tab label="Allocation Table" icon={<Map />} />
            <Tab label="Admin Tools" icon={<AdminPanelSettings />} />
            <Tab label="Staff Dashboard" icon={<Dashboard />} />
          </Tabs>

          <Box sx={{ 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            p: 3,
            minHeight: '70vh'
          }}>
            <Routes>
              <Route index element={<SystemConfiguration />} />
              <Route path="system-config" element={<SystemConfiguration />} />
              <Route path="user-management" element={<UserManagement />} />
              
              {/* Employee Monitoring Routes */}
              <Route path="employee-monitoring" element={<EmployeeMonitoring />} />
              <Route path="employee-monitoring/:employeeId" element={<PerformanceMetrics />} />
              
              {/* Department Performance Routes */}
              <Route path="department-performance" element={<DepartmentPerformance />} />
              <Route path="department-performance/:departmentId" element={<PerformanceMetrics />} />
              
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="analytics" element={<AnalyticsReporting />} />
              <Route path="allocation" element={<AllocationTable />} />
              <Route path="admin-tools" element={<AdminTools />} />
              
              {/* Full Staff Dashboard Access */}
              <Route path="staff-dashboard/*" element={<StaffDashboard adminView={true} />} />
            </Routes>
            <Outlet />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard;