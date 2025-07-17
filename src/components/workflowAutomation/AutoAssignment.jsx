// /src/components/WorkflowAutomation/AutoAssignment.jsx
import { AssignmentInd, AutoFixHigh, PersonSearch } from '@mui/icons-material';
import { Box, Button, Chip, LinearProgress, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import React from 'react';
import { useGetEmployeesQuery, useGetPendingCasesQuery } from '../../api/landBoardApi';

const AutoAssignment = () => {
  const { data: employees = [], isLoading: employeesLoading } = useGetEmployeesQuery();
  const { data: pendingCases = [], isLoading: casesLoading } = useGetPendingCasesQuery();
  const [assignmentLog, setAssignmentLog] = React.useState([]);

  // Algorithm to match cases to employees based on skills and workload
  const autoAssignCases = () => {
    const availableEmployees = employees
      .filter(emp => emp.currentWorkload < emp.maxCapacity)
      .sort((a, b) => a.specializationScore - b.specializationScore);

    const assignments = pendingCases.map(caseItem => {
      const suitableEmployee = availableEmployees.find(emp => 
        emp.skills.some(skill => caseItem.requiredSkills.includes(skill))
      );
      
      if (suitableEmployee) {
        return {
          caseId: caseItem.id,
          caseType: caseItem.type,
          employeeId: suitableEmployee.id,
          employeeName: suitableEmployee.name,
          specializationMatch: calculateMatchScore(suitableEmployee, caseItem),
          timestamp: new Date().toISOString()
        };
      }
      return null;
    }).filter(Boolean);

    setAssignmentLog(prev => [...assignments, ...prev]);
    return assignments;
  };

  const calculateMatchScore = (employee, caseItem) => {
    const skillMatch = employee.skills.filter(skill => 
      caseItem.requiredSkills.includes(skill)
    ).length / caseItem.requiredSkills.length;
    
    const workloadFactor = 1 - (employee.currentWorkload / employee.maxCapacity);
    return Math.round((skillMatch * 0.7 + workloadFactor * 0.3) * 100);
  };

  const columns = [
    { field: 'caseId', headerName: 'Case ID', width: 120 },
    { field: 'caseType', headerName: 'Case Type', width: 180 },
    { field: 'employeeName', headerName: 'Assigned To', width: 200 },
    { 
      field: 'specializationMatch', 
      headerName: 'Match Score', 
      width: 150,
      renderCell: (params) => (
        <Tooltip title={`Specialization and workload compatibility score`}>
          <LinearProgress 
            variant="determinate" 
            value={params.value} 
            color={
              params.value > 80 ? 'success' :
              params.value > 50 ? 'warning' : 'error'
            }
            sx={{ height: 8, width: '100%', borderRadius: 4 }}
          />
        </Tooltip>
      )
    },
    { field: 'timestamp', headerName: 'Assigned At', width: 200 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AutoFixHigh sx={{ mr: 1 }} /> Case Auto-Assignment System
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AssignmentInd />}
          onClick={autoAssignCases}
          disabled={employeesLoading || casesLoading}
        >
          Run Auto-Assignment
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<PersonSearch />}
          disabled={employeesLoading}
        >
          View Available Staff
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Chip 
          label={`${pendingCases.length} Pending Cases`} 
          color="warning" 
          variant="outlined" 
          sx={{ mr: 1 }}
        />
        <Chip 
          label={`${employees.filter(e => e.currentWorkload < e.maxCapacity).length} Available Staff`} 
          color="success" 
          variant="outlined" 
        />
      </Box>

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={assignmentLog}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          loading={employeesLoading || casesLoading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Box>
    </Box>
  );
};

export default AutoAssignment;