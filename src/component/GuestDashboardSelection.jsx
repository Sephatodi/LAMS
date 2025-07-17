// component/GuestDashboardSelection.js
import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  Chip,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Person as PersonIcon,
  Engineering as StaffIcon,
  AdminPanelSettings as AdminIcon,
  Warning as WarningIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const GuestDashboardSelection = ({ onRegisterClick }) => {
  const navigate = useNavigate();

  const dashboardOptions = [
    {
      title: "Citizen Dashboard",
      description: "Explore land records, application processes, and citizen features",
      icon: <PersonIcon fontSize="large" color="primary" />,
      path: "/citizen-dashboard",
      color: "primary"
    },
    {
      title: "Staff Dashboard",
      description: "View staff tools for land allocation and application processing",
      icon: <StaffIcon fontSize="large" color="secondary" />,
      path: "/staff-dashboard",
      color: "secondary"
    },
    {
      title: "Admin Dashboard",
      description: "Explore administrative controls and system configuration",
      icon: <AdminIcon fontSize="large" color="error" />,
      path: "/admin-dashboard",
      color: "error"
    }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={4}>
        <Chip 
          label="GUEST MODE" 
          color="warning" 
          variant="outlined"
          icon={<WarningIcon />}
          sx={{ mb: 2 }}
        />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Explore System Features
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You're previewing the system. Changes won't be saved permanently.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        Select a dashboard to experience different user perspectives.
      </Alert>

      <Grid container spacing={3}>
        {dashboardOptions.map((option) => (
          <Grid item xs={12} sm={6} md={4} key={option.path}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <Box sx={{ mb: 2 }}>{option.icon}</Box>
              <Typography variant="h6" gutterBottom>
                {option.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {option.description}
              </Typography>
              <Button
                variant="contained"
                color={option.color}
                fullWidth
                onClick={() => navigate(option.path)}
                sx={{ mt: 'auto' }}
              >
                Explore {option.title.split(' ')[0]}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<LoginIcon />}
          onClick={onRegisterClick}
          sx={{ mr: 2 }}
        >
          Register to Save Changes
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Create an account to access all features permanently.
        </Typography>
      </Box>
    </Container>
  );
};

export default GuestDashboardSelection;