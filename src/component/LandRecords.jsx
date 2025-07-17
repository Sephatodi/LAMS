/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    Assignment, CalendarToday,
    CheckCircle,
    ContactMail, Description,
    Error,
    Gavel,
    Help,
    Home, LocationOn, MonetizationOn, Person, Receipt, Security,
    VpnKey, Warning
} from '@mui/icons-material';
import {
    Alert, Box, Button, Card, CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider, FormControl,
    FormControlLabel,
    FormHelperText,
    Grid, InputLabel, List,
    ListItem, ListItemIcon, ListItemText, MenuItem, Paper,
    Select,
    Step, StepLabel,
    Stepper,
    Tab,
    Table, TableBody, TableCell, TableContainer,
    TableRow,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import * as Yup from 'yup';

// Service types
const SERVICE_TYPES = {
  CERTIFICATE_REPLACEMENT: 'certificate_replacement',
  LEASE_REGISTRATION: 'lease_registration',
  MORTGAGE_REGISTRATION: 'mortgage_registration',
  LAND_APPEAL: 'land_appeal'
};

const LandRecords = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [serviceType, setServiceType] = useState('');
  const [_caseNumber, setCaseNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({});
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Fetch user's land records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setRecords([
            {
              id: 'TLR-001',
              plotNumber: 'TL-002',
              region: 'Francistown',
              size: '750 sqm',
              allocationDate: '2023-05-01',
              purpose: 'residential',
              certificateNumber: 'TLC-2023-5678',
              leaseNumber: 'L-2023-9876',
              hasMortgage: false
            }
          ]);
          setLoadingRecords(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching land records:', error);
        setLoadingRecords(false);
      }
    };

    fetchRecords();
  }, []);

  // Formik configuration for certificate replacement
  const replacementFormik = useFormik({
    initialValues: {
      documentType: 'certificate',
      documentNumber: '',
      lossReason: 'lost',
      policeReport: null,
      idCopy: null,
      affidavit: null,
      contactNumber: '+267',
      email: ''
    },
    validationSchema: Yup.object({
      documentType: Yup.string().required('Required'),
      documentNumber: Yup.string().required('Required'),
      lossReason: Yup.string().required('Required'),
      policeReport: Yup.mixed().required('Police report is required'),
      idCopy: Yup.mixed().required('ID copy is required'),
      affidavit: Yup.mixed().required('Affidavit is required'),
      contactNumber: Yup.string()
        .matches(/^\+267\d{7}$/, 'Invalid Botswana number')
        .required('Required'),
      email: Yup.string().email('Invalid email')
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newCaseNumber = `CR-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
        setCaseNumber(newCaseNumber);
        setServiceType(SERVICE_TYPES.CERTIFICATE_REPLACEMENT);
        setOpenDialog(true);
        setDialogContent({
          title: 'Replacement Request Submitted',
          message: `Your ${values.documentType} replacement request has been registered.`,
          details: `Case Number: ${newCaseNumber}\nFee to pay: ${values.documentType === 'certificate' ? 'P20.00' : 'P40.00'}`,
          nextSteps: 'Please visit your nearest Land Board office to complete the process and make payment.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // Formik configuration for lease registration
  const leaseFormik = useFormik({
    initialValues: {
      applicantType: 'individual',
      leaseNumber: '',
      propertyLocation: 'north',
      leaseCopies: [],
      sketchPlans: [],
      diagrams: [],
      folders: 2,
      // Individual fields
      idType: 'omang',
      idNumber: '',
      passportNumber: '',
      ministerConsent: null,
      birthAffidavit: null,
      annexureA: null,
      // Juristic person fields
      companyName: '',
      shareholdingCertificate: null,
      companyResolution: null,
      incorporationCertificate: null,
      memorandumArticles: null,
      shareholders: []
    },
    onSubmit: async (_values) => {
      setIsSubmitting(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newCaseNumber = `LR-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
        setCaseNumber(newCaseNumber);
        setServiceType(SERVICE_TYPES.LEASE_REGISTRATION);
        setOpenDialog(true);
        setDialogContent({
          title: 'Lease Registration Submitted',
          message: 'Your lease registration documents have been received.',
          details: `Case Number: ${newCaseNumber}\nProcessing Time: 1 working day`,
          nextSteps: 'Your documents will be processed at the Deeds Registry office.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // Formik configuration for mortgage registration
  const mortgageFormik = useFormik({
    initialValues: {
      propertyTitleNumber: '',
      mortgageDraft: null,
      titleDeedCopy: null,
      powerOfAttorney: null,
      lenderResolution: null,
      conveyancerDetails: {
        name: '',
        firm: '',
        contact: ''
      }
    },
    onSubmit: async (_values) => {
      setIsSubmitting(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newCaseNumber = `MR-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
        setCaseNumber(newCaseNumber);
        setServiceType(SERVICE_TYPES.MORTGAGE_REGISTRATION);
        setOpenDialog(true);
        setDialogContent({
          title: 'Mortgage Registration Submitted',
          message: 'Your mortgage bond registration has been initiated.',
          details: `Case Number: ${newCaseNumber}\nProcessing Time: 5 working days`,
          nextSteps: 'Your conveyancer will be notified when the registration is complete.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleServiceSelect = (service) => {
    setServiceType(service);
    setActiveStep(0);
  };

  const handleNextStep = () => setActiveStep(prev => prev + 1);
  const handlePrevStep = () => setActiveStep(prev => prev - 1);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (serviceType === SERVICE_TYPES.CERTIFICATE_REPLACEMENT) {
      replacementFormik.resetForm();
    } else if (serviceType === SERVICE_TYPES.LEASE_REGISTRATION) {
      leaseFormik.resetForm();
    } else if (serviceType === SERVICE_TYPES.MORTGAGE_REGISTRATION) {
      mortgageFormik.resetForm();
    }
    setActiveTab(0);
    setServiceType('');
  };

  const handleFileDrop = (formik, field, acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      formik.setFieldError(field, 'File too large or invalid type. Max size: 5MB');
    } else {
      formik.setFieldValue(field, acceptedFiles);
      formik.setFieldError(field, undefined);
    }
  };

  const renderServiceSelection = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Select Land Service
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card 
            onClick={() => handleServiceSelect(SERVICE_TYPES.CERTIFICATE_REPLACEMENT)}
            sx={{ 
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assignment color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Certificate/Lease Replacement</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Request replacement for lost, stolen, or damaged land certificates or leases
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Chip label="Fee: P20-P40" size="small" />
                <Chip label="Processing: 1 month" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card 
            onClick={() => handleServiceSelect(SERVICE_TYPES.LEASE_REGISTRATION)}
            sx={{ 
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VpnKey color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Lease Registration</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Register your lease agreement with the Deeds Registry
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Chip label="No fee" size="small" />
                <Chip label="Processing: 1 day" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card 
            onClick={() => handleServiceSelect(SERVICE_TYPES.MORTGAGE_REGISTRATION)}
            sx={{ 
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MonetizationOn color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Mortgage Registration</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Register a mortgage bond over your property
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Chip label="Conveyancer fees apply" size="small" />
                <Chip label="Processing: 5 days" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card 
            onClick={() => handleServiceSelect(SERVICE_TYPES.LAND_APPEAL)}
            sx={{ 
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Gavel color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Land Tribunal Appeal</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Appeal a decision by the Minister, Land Board, or Planning Authority
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Chip label="Fee: P10" size="small" />
                <Chip label="Processing: 12 months" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderCertificateReplacementForm = () => (
    <Box component="form" onSubmit={replacementFormik.handleSubmit}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step><StepLabel>Document Details</StepLabel></Step>
        <Step><StepLabel>Upload Documents</StepLabel></Step>
        <Step><StepLabel>Review & Submit</StepLabel></Step>
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select
                name="documentType"
                value={replacementFormik.values.documentType}
                onChange={replacementFormik.handleChange}
                label="Document Type"
              >
                <MenuItem value="certificate">Certificate (P20)</MenuItem>
                <MenuItem value="lease">Lease (P40)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="documentNumber"
              label="Document Number"
              value={replacementFormik.values.documentNumber}
              onChange={replacementFormik.handleChange}
              error={replacementFormik.touched.documentNumber && Boolean(replacementFormik.errors.documentNumber)}
              helperText={replacementFormik.touched.documentNumber && replacementFormik.errors.documentNumber}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Reason for Replacement</InputLabel>
              <Select
                name="lossReason"
                value={replacementFormik.values.lossReason}
                onChange={replacementFormik.handleChange}
                label="Reason for Replacement"
              >
                <MenuItem value="lost">Lost</MenuItem>
                <MenuItem value="stolen">Stolen</MenuItem>
                <MenuItem value="damaged">Damaged</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="contactNumber"
              label="Contact Number"
              value={replacementFormik.values.contactNumber}
              onChange={replacementFormik.handleChange}
              error={replacementFormik.touched.contactNumber && Boolean(replacementFormik.errors.contactNumber)}
              helperText={replacementFormik.touched.contactNumber && replacementFormik.errors.contactNumber}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="email"
              label="Email (Optional)"
              value={replacementFormik.values.email}
              onChange={replacementFormik.handleChange}
              error={replacementFormik.touched.email && Boolean(replacementFormik.errors.email)}
              helperText={replacementFormik.touched.email && replacementFormik.errors.email}
            />
          </Grid>
        </Grid>
      )}

      {activeStep === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Required Documents</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Please upload certified copies of the following documents:
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Dropzone
              onDrop={(acceptedFiles, rejectedFiles) => 
                handleFileDrop(replacementFormik, 'policeReport', acceptedFiles, rejectedFiles)
              }
              accept={['application/pdf', 'image/*']}
              maxSize={5 * 1024 * 1024}
            >
              {({ getRootProps, getInputProps }) => (
                <Paper {...getRootProps()} variant="outlined" sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }}>
                  <input {...getInputProps()} />
                  <Typography>Police Report/Affidavit</Typography>
                  <Typography variant="body2" color="text.secondary">
                    (Max 5MB, PDF or image)
                  </Typography>
                </Paper>
              )}
            </Dropzone>
            {replacementFormik.values.policeReport && (
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={replacementFormik.values.policeReport[0].name}
                  onDelete={() => replacementFormik.setFieldValue('policeReport', null)}
                />
              </Box>
            )}
            {replacementFormik.touched.policeReport && replacementFormik.errors.policeReport && (
              <FormHelperText error>{replacementFormik.errors.policeReport}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Dropzone
              onDrop={(acceptedFiles, rejectedFiles) => 
                handleFileDrop(replacementFormik, 'idCopy', acceptedFiles, rejectedFiles)
              }
              accept={['application/pdf', 'image/*']}
              maxSize={5 * 1024 * 1024}
            >
              {({ getRootProps, getInputProps }) => (
                <Paper {...getRootProps()} variant="outlined" sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }}>
                  <input {...getInputProps()} />
                  <Typography>Certified Copy of Omang/ID</Typography>
                  <Typography variant="body2" color="text.secondary">
                    (Max 5MB, PDF or image)
                  </Typography>
                </Paper>
              )}
            </Dropzone>
            {replacementFormik.values.idCopy && (
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={replacementFormik.values.idCopy[0].name}
                  onDelete={() => replacementFormik.setFieldValue('idCopy', null)}
                />
              </Box>
            )}
            {replacementFormik.touched.idCopy && replacementFormik.errors.idCopy && (
              <FormHelperText error>{replacementFormik.errors.idCopy}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Dropzone
              onDrop={(acceptedFiles, rejectedFiles) => 
                handleFileDrop(replacementFormik, 'affidavit', acceptedFiles, rejectedFiles)
              }
              accept={['application/pdf']}
              maxSize={5 * 1024 * 1024}
            >
              {({ getRootProps, getInputProps }) => (
                <Paper {...getRootProps()} variant="outlined" sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }}>
                  <input {...getInputProps()} />
                  <Typography>Notarized Affidavit</Typography>
                  <Typography variant="body2" color="text.secondary">
                    (Max 5MB, PDF only)
                  </Typography>
                </Paper>
              )}
            </Dropzone>
            {replacementFormik.values.affidavit && (
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={replacementFormik.values.affidavit[0].name}
                  onDelete={() => replacementFormik.setFieldValue('affidavit', null)}
                />
              </Box>
            )}
            {replacementFormik.touched.affidavit && replacementFormik.errors.affidavit && (
              <FormHelperText error>{replacementFormik.errors.affidavit}</FormHelperText>
            )}
          </Grid>
        </Grid>
      )}

      {activeStep === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Review Your Request</Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Document Type</TableCell>
                  <TableCell>{replacementFormik.values.documentType === 'certificate' ? 'Certificate' : 'Lease'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Document Number</TableCell>
                  <TableCell>{replacementFormik.values.documentNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                  <TableCell>{replacementFormik.values.lossReason}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contact Number</TableCell>
                  <TableCell>{replacementFormik.values.contactNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell>{replacementFormik.values.email || 'Not provided'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle2" gutterBottom>Uploaded Documents:</Typography>
          <List dense>
            {replacementFormik.values.policeReport && (
              <ListItem>
                <ListItemIcon><Description /></ListItemIcon>
                <ListItemText primary="Police Report" secondary={replacementFormik.values.policeReport[0].name} />
              </ListItem>
            )}
            {replacementFormik.values.idCopy && (
              <ListItem>
                <ListItemIcon><Description /></ListItemIcon>
                <ListItemText primary="ID Copy" secondary={replacementFormik.values.idCopy[0].name} />
              </ListItem>
            )}
            {replacementFormik.values.affidavit && (
              <ListItem>
                <ListItemIcon><Description /></ListItemIcon>
                <ListItemText primary="Affidavit" secondary={replacementFormik.values.affidavit[0].name} />
              </ListItem>
            )}
          </List>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              Fee to pay: {replacementFormik.values.documentType === 'certificate' ? 'P20.00' : 'P40.00'}
            </Typography>
            <Typography variant="body2">
              Processing time: Approximately 1 month
            </Typography>
          </Alert>

          <FormControlLabel
            control={<Checkbox required />}
            label="I declare that the information provided is true and correct"
            sx={{ mt: 2 }}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          disabled={activeStep === 0}
          onClick={handlePrevStep}
        >
          Back
        </Button>
        {activeStep < 2 ? (
          <Button
            variant="contained"
            onClick={handleNextStep}
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            endIcon={isSubmitting ? <CircularProgress size={24} /> : null}
          >
            Submit Request
          </Button>
        )}
      </Box>
    </Box>
  );

  const renderLandRecords = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        <Receipt sx={{ verticalAlign: 'middle', mr: 1 }} />
        My Land Records
      </Typography>
      
      {loadingRecords ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : records.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          You do not have any allocated land records yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {records.map((record) => (
            <Grid item xs={12} key={record.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {record.plotNumber} - {record.region}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><LocationOn /></ListItemIcon>
                          <ListItemText primary="Region" secondary={record.region} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Home /></ListItemIcon>
                          <ListItemText primary="Plot Size" secondary={record.size} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CalendarToday /></ListItemIcon>
                          <ListItemText primary="Allocation Date" secondary={record.allocationDate} />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><Description /></ListItemIcon>
                          <ListItemText primary="Certificate Number" secondary={record.certificateNumber} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Person /></ListItemIcon>
                          <ListItemText primary="Purpose" secondary={record.purpose} />
                        </ListItem>
                        {record.leaseNumber && (
                          <ListItem>
                            <ListItemIcon><VpnKey /></ListItemIcon>
                            <ListItemText primary="Lease Number" secondary={record.leaseNumber} />
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<Description />}
                      onClick={() => handleServiceSelect(SERVICE_TYPES.CERTIFICATE_REPLACEMENT)}
                    >
                      Replace Certificate
                    </Button>
                    {record.leaseNumber && (
                      <Button 
                        variant="outlined" 
                        startIcon={<VpnKey />}
                        onClick={() => handleServiceSelect(SERVICE_TYPES.LEASE_REGISTRATION)}
                      >
                        Register Lease
                      </Button>
                    )}
                    {!record.hasMortgage && (
                      <Button 
                        variant="outlined" 
                        startIcon={<MonetizationOn />}
                        onClick={() => handleServiceSelect(SERVICE_TYPES.MORTGAGE_REGISTRATION)}
                      >
                        Register Mortgage
                      </Button>
                    )}
                    <Button variant="contained" sx={{ ml: 'auto' }}>
                      Print Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Home sx={{ mr: 2, fontSize: 'inherit' }} />
        Botswana Land Services Portal
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="My Land Records" icon={<Receipt />} />
        <Tab label="Services" icon={<Assignment />} />
        <Tab label="Help & Support" icon={<Help />} />
      </Tabs>

      {activeTab === 0 && renderLandRecords()}
      
      {activeTab === 1 && (
        serviceType ? (
          serviceType === SERVICE_TYPES.CERTIFICATE_REPLACEMENT ? renderCertificateReplacementForm() :
          serviceType === SERVICE_TYPES.LEASE_REGISTRATION ? 'Lease Registration Form' :
          serviceType === SERVICE_TYPES.MORTGAGE_REGISTRATION ? 'Mortgage Registration Form' :
          'Land Appeal Form'
        ) : renderServiceSelection()
      )}

      {activeTab === 2 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Help & Support
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ContactMail sx={{ mr: 1 }} />
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Ministry of Land Management, Water and Sanitation Services"
                        secondary="Toll Free: 0800 600 737"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Deeds Registry Gaborone"
                        secondary="Government Enclave, Attorney General's Chamber"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Deeds Registry Francistown"
                        secondary="Plot 252 Light Industrial (Old BGI Building)"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ mr: 1 }} />
                    Important Notes
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText primary="Office Hours" secondary="07:30 to 12:45 and 13:45 to 16:30, Monday to Friday" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Error color="warning" /></ListItemIcon>
                      <ListItemText primary="Processing Times" secondary="Vary by service type (1 day to 12 months)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Security color="info" /></ListItemIcon>
                      <ListItemText primary="Document Security" secondary="Always provide certified copies of important documents" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircle color="success" sx={{ mr: 1 }} />
          {dialogContent.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {dialogContent.message}
          </Typography>
          <Typography variant="body1" paragraph>
            {dialogContent.details}
          </Typography>
          <Typography variant="body1">
            {dialogContent.nextSteps}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LandRecords;