/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";

const PublicQueue = () => {
  // Simulated queue data with integrity scores
  const queueData = [
    { id: 1, applicant: "John Doe", status: "Pending", integrityScore: 45 },
    { id: 2, applicant: "Jane Smith", status: "Approved", integrityScore: 85 },
    { id: 3, applicant: "Alice Johnson", status: "Rejected", integrityScore: 30 },
  ];

  const reportConcern = (applicationId) => {
    // Open reporting dialog
    console.log(`Reporting concern for application ${applicationId}`);
    // In a real implementation, this would open a dialog or navigate to a reporting page
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Public Queue for Land Allocation
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Applicant</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queueData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>
                  {item.applicant}
                  {item.integrityScore < 50 && (
                    <Tooltip title="Low integrity score - requires verification">
                      <ReportProblemIcon color="warning" sx={{ ml: 1 }} />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          item.status === "Pending"
                            ? "#ffeb3b"
                            : item.status === "Approved"
                            ? "#4caf50"
                            : "#f44336",
                        color: "#fff",
                        mr: 1
                      }}
                    >
                      {item.status}
                    </Box>
                    <Button 
                      size="small" 
                      onClick={() => reportConcern(item.id)}
                      startIcon={<ReportProblemIcon />}
                    >
                      Report
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PublicQueue;