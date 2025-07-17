/** @jsxRuntime classic */
/** @jsx React.createElement */


import { ArrowDownward, ArrowUpward, People } from '@mui/icons-material';
import { Box, Button, Chip, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import  React, { useEffect, useState } from 'react';

const QueueManagement = () => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    // Fetch queue from API
    setQueue([
      {
        id: 'TL-APP-001',
        position: 1,
        applicant: 'John Doe',
        date: '2023-05-01',
        status: 'pending',
        daysInQueue: 5
      },
      // More queue items...
    ]);
  }, []);

  const moveInQueue = (id, direction) => {
    // API call to update queue position
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 3 }}>
        <Typography variant="h4" gutterBottom>
          <People sx={{ mr: 1, verticalAlign: 'middle' }} />
          Application Queue Management
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Queue Position</TableCell>
                <TableCell>Application ID</TableCell>
                <TableCell>Applicant</TableCell>
                <TableCell>Submission Date</TableCell>
                <TableCell>Days in Queue</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.position}</TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.applicant}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.daysInQueue}</TableCell>
                  <TableCell>
                    <Chip label={item.status} color="primary" />
                  </TableCell>
                  <TableCell>
                    <Button 
                      startIcon={<ArrowUpward />} 
                      onClick={() => moveInQueue(item.id, 'up')}
                    >
                      Promote
                    </Button>
                    <Button 
                      startIcon={<ArrowDownward />} 
                      onClick={() => moveInQueue(item.id, 'down')}
                    >
                      Demote
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default QueueManagement;