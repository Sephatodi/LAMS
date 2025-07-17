/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Assignment,
    Cancel,
    CheckCircle,
    Description as DescriptionIcon,
    HourglassEmpty
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WaitlistStatus from './WaitlistStatus';

const ApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Simulate API call with more detailed data
        setTimeout(() => {
          setApplications([
            {
              id: 'TL-APP-1234',
              plotNumber: 'TL-001',
              region: 'Gaborone',
              date: '2023-05-15',
              status: 'pending',
              lastUpdate: '2023-05-20',
              type: 'customary',
              waitlistPosition: 42,
              estimatedTime: '3-4 weeks',
              documents: ['ID Copy', 'Proof of Residence'],
              nextSteps: 'Awaiting site inspection'
            },
            {
              id: 'TL-APP-5678',
              plotNumber: 'TL-002',
              region: 'Francistown',
              date: '2023-04-10',
              status: 'approved',
              lastUpdate: '2023-05-01',
              type: 'common-law',
              allocationDate: '2023-06-15',
              leaseNumber: 'L-2023-9876',
              paymentDue: 'P1,200.00'
            },
            {
              id: 'TL-APP-9012',
              plotNumber: 'TL-003',
              region: 'Maun',
              date: '2023-03-22',
              status: 'rejected',
              lastUpdate: '2023-04-15',
              reason: 'Incomplete documentation',
              appealDeadline: '2023-05-15',
              canReapply: true
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <HourglassEmpty color="warning" />;
      case 'approved':
        return <CheckCircle color="success" />;
      case 'rejected':
        return <Cancel color="error" />;
      default:
        return <HourglassEmpty />;
    }
  };

  const viewApplicationDetails = (app) => {
    setSelectedApplication(app);
  };

  const handleNewApplication = () => {
    navigate('/apply-for-land');
  };

  const handleBackToList = () => {
    setSelectedApplication(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (selectedApplication) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackToList}
            sx={{ mb: 2 }}
          >
            Back to Applications
          </Button>
          
          <Typography variant="h4" gutterBottom>
            Application Details: {selectedApplication.id}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography><strong>Plot Number:</strong> {selectedApplication.plotNumber}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Region:</strong> {selectedApplication.region}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Application Date:</strong> {selectedApplication.date}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Last Update:</strong> {selectedApplication.lastUpdate}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography><strong>Status:</strong></Typography>
                        <Chip
                          icon={getStatusIcon(selectedApplication.status)}
                          label={selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                          variant="outlined"
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" gutterBottom>
                        Processing Information
                      </Typography>
                      <WaitlistStatus 
                        position={selectedApplication.waitlistPosition} 
                        estimatedTime={selectedApplication.estimatedTime} 
                      />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        <strong>Next Steps:</strong> {selectedApplication.nextSteps}
                      </Typography>
                    </>
                  )}
                  
                  {selectedApplication.status === 'approved' && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Your application has been approved!
                      </Alert>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography><strong>Allocation Date:</strong> {selectedApplication.allocationDate}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography><strong>Lease Number:</strong> {selectedApplication.leaseNumber}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography><strong>Payment Due:</strong> {selectedApplication.paymentDue}</Typography>
                        </Grid>
                      </Grid>
                      <Button 
                        variant="contained" 
                        sx={{ mt: 3 }}
                        onClick={() => navigate('/payment')}
                      >
                        Make Payment
                      </Button>
                    </>
                  )}
                  
                  {selectedApplication.status === 'rejected' && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Your application was not approved
                      </Alert>
                      <Typography><strong>Reason:</strong> {selectedApplication.reason}</Typography>
                      {selectedApplication.appealDeadline && (
                        <Typography sx={{ mt: 1 }}>
                          <strong>Appeal Deadline:</strong> {selectedApplication.appealDeadline}
                        </Typography>
                      )}
                      <Box sx={{ mt: 3 }}>
                        {selectedApplication.canReapply ? (
                          <Button 
                            variant="contained" 
                            onClick={handleNewApplication}
                          >
                            Submit New Application
                          </Button>
                        ) : (
                          <Button 
                            variant="outlined" 
                            onClick={() => navigate('/appeal')}
                          >
                            File Appeal
                          </Button>
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Documents
                  </Typography>
                  <List>
                    {selectedApplication.documents?.map((doc, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar>
                            <DescriptionIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={doc} />
                      </ListItem>
                    ))}
                  </List>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/upload-documents')}
                  >
                    Upload Additional Documents
                  </Button>
                </CardContent>
              </Card>
              
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Need Help?
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Contact the Land Board for assistance with your application.
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate('/support')}
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            <Assignment sx={{ verticalAlign: 'middle', mr: 1 }} />
            My Land Applications
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleNewApplication}
            startIcon={<AddIcon />}
          >
            New Application
          </Button>
        </Box>
        
        {applications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Applications Found
            </Typography>
            <Typography sx={{ mb: 3 }}>
              You have not submitted any land applications yet.
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleNewApplication}
              startIcon={<AddIcon />}
            >
              Start New Application
            </Button>
          </Paper>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              Track the status of your land applications below. Click on any application to view detailed information.
            </Alert>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Application ID</TableCell>
                    <TableCell>Plot Number</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Application Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow 
                      key={app.id} 
                      hover 
                      onClick={() => viewApplicationDetails(app)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{app.id}</TableCell>
                      <TableCell>{app.plotNumber}</TableCell>
                      <TableCell>{app.region}</TableCell>
                      <TableCell>{app.date}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(app.status)}
                          label={app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          variant="outlined"
                          color={
                            app.status === 'approved' ? 'success' : 
                            app.status === 'rejected' ? 'error' : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            viewApplicationDetails(app);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {applications.length} of {applications.length} applications
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default ApplicationStatus;