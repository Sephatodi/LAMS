/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    AccountBalance as AccountBalanceIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Article as ArticleIcon,
    AttachFile as AttachFileIcon,
    Business as BusinessIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    Description as FormIcon,
    Home as HomeIcon,
    Gavel as LawIcon,
    Map as MapIcon,
    People as PeopleIcon,
    Receipt as ReceiptIcon,
    Search as SearchIcon,
    Send as SendIcon,
    Timeline as TimelineIcon,
    Update as UpdateIcon,
    Videocam as VideoIcon
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';

// Chatbot configuration
const chatbotConfig = {
  initialMessages: [{
    message: "Hello! I'm your Land Services Assistant. How can I help you today?",
    type: 'bot',
    id: 1
  }],
  botName: "LandBot",
  customStyles: {
    botMessageBox: {
      backgroundColor: '#1976d2',
    },
    chatButton: {
      backgroundColor: '#1976d2',
    },
  },
  widgets: [
    {
      widgetName: 'serviceList',
      widgetFunc: (props) => <ServiceListWidget {...props} />,
      props: { services: LAND_SERVICES }
    }
  ]
};

const ServiceListWidget = ({ services }) => (
  <List dense>
    {services.slice(0, 3).map(service => (
      <ListItem key={service.id}>
        <ListItemText 
          primary={service.title} 
          secondary={service.overview} 
        />
      </ListItem>
    ))}
  </List>
);

// ====================== CONSTANTS ======================
const LAND_SERVICES = [
  {
    id: 1,
    title: 'Replacement of Lost/Burnt/Stolen/Misplaced Certificates/Lease',
    type: 'service',
    category: 'certificate-management',
    icon: <ReceiptIcon />,
    overview: 'Procedure for replacing lost, stolen, or damaged land documents',
    eligibility: 'Current land title holders',
    steps: [
      'Submit request letter to Land Board',
      'Provide police affidavit',
      'Pay replacement fees'
    ],
    requirements: [
      'Certified copy of Omang',
      'Affidavit from Botswana Police'
    ],
    cost: 'P20 (Certificate) / P40 (Lease)',
    duration: '1 month',
    forms: ['Replacement Request Form'],
    lawReference: 'Land Act Section 12.4',
    videoGuide: 'https://example.com/videos/certificate-replacement'
  },
  {
    id: 2,
    title: 'Plot Inheritance Process',
    type: 'service',
    category: 'inheritance',
    icon: <AccountBalanceIcon />,
    overview: 'Transferring land rights after owner\'s death',
    eligibility: [
      'Botswana citizens',
      'Legal heirs',
      'Individuals over 18 years'
    ],
    steps: [
      'Obtain Bogosi confirmation letter',
      'Submit inheritance resolution',
      'Complete Transfer Form 407'
    ],
    requirements: [
      'Death certificate',
      'Marriage certificate',
      'Original plot certificate'
    ],
    duration: '3 months',
    cost: 'Free',
    forms: ['Transfer of Land Rights Form'],
    lawReference: 'Inheritance Act 2021',
    videoGuide: 'https://example.com/videos/inheritance-process'
  },
  {
    id: 3,
    title: 'Conversion from Customary to Common Law',
    type: 'service',
    category: 'land-conversion',
    icon: <BusinessIcon />,
    overview: 'Convert customary land rights to common law lease',
    eligibility: [
      'Botswana citizens',
      'Individuals over 18 years'
    ],
    steps: [
      'Complete application form',
      'Submit required documents',
      'Pay conversion fees'
    ],
    requirements: [
      'Marriage certificate (if applicable)',
      'Proof of marriage regime',
      'Original plot certificate'
    ],
    duration: '3 months',
    cost: 'P150 (sketch plan) + P10 (application) + P100 (lease)',
    forms: ['Conversion Application Form'],
    lawReference: 'Land Act Section 8.2'
  },
  {
    id: 4,
    title: 'Application for Common Land Law Rights',
    type: 'service',
    category: 'land-application',
    icon: <MapIcon />,
    overview: 'Apply for business, agricultural or residential land rights',
    eligibility: [
      'Botswana citizens',
      'Registered companies',
      'Non-citizens with Minister consent'
    ],
    steps: [
      'Respond to land advertisement',
      'Complete application form',
      'Submit required documents'
    ],
    requirements: [
      'Certified Omang copy',
      'Marriage certificate',
      'Financial proof'
    ],
    duration: 'Varies by plot availability',
    cost: 'P150 (sketch plan) + P10 (application) + variable lease fees',
    forms: ['Common Law Application Form'],
    lawReference: 'Land Act Section 5.1'
  },
  {
    id: 5,
    title: 'Application for Customary Law Land Grant',
    type: 'service',
    category: 'customary-land',
    icon: <HomeIcon />,
    overview: 'Apply for residential or agricultural land under customary law',
    eligibility: [
      'Botswana citizens',
      'Individuals over 18 years'
    ],
    steps: [
      'Join waiting list',
      'Complete application when plot available',
      'Submit required documents'
    ],
    requirements: [
      'Certified Omang copy',
      'Marriage documents if applicable'
    ],
    duration: 'Varies by availability',
    cost: 'Free',
    forms: ['Customary Land Application Form'],
    lawReference: 'Tribal Land Act Section 3.4'
  },
  {
    id: 6,
    title: 'Sales of Maps',
    type: 'service',
    category: 'map-services',
    icon: <MapIcon />,
    overview: 'Purchase land use and development proposal maps',
    eligibility: [
      'Government departments',
      'General public',
      'Local authorities'
    ],
    steps: [
      'Visit Department of Town and Country Planning',
      'Select required map',
      'Make payment'
    ],
    requirements: [
      'GPO for government departments',
      'None for general public'
    ],
    duration: '1 day',
    cost: 'P10 (A4) to P120 (A0)',
    forms: [],
    lawReference: 'Town and Country Planning Act'
  }
];

const SERVICE_FORMS = {
  'Replacement Request Form': {
    steps: ['Personal Details', 'Document Details', 'Payment'],
    fields: [
      { name: 'applicantName', label: 'Full Name', type: 'text', required: true },
      { name: 'idNumber', label: 'Omang Number', type: 'text', required: true },
      { name: 'documentType', label: 'Document Type', type: 'select', options: ['Certificate', 'Lease'], required: true },
      { name: 'reason', label: 'Reason for Replacement', type: 'select', options: ['Lost', 'Stolen', 'Damaged'], required: true },
      { name: 'policeCaseNumber', label: 'Police Case Number (if applicable)', type: 'text' },
      { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['Cash', 'Bank Transfer'], required: true }
    ]
  },
  'Transfer of Land Rights Form': {
    steps: ['Deceased Information', 'Heir Information', 'Supporting Documents'],
    fields: [
      { name: 'deceasedName', label: 'Deceased Full Name', type: 'text', required: true },
      { name: 'deceasedId', label: 'Deceased Omang Number', type: 'text', required: true },
      { name: 'deathCertificateNumber', label: 'Death Certificate Number', type: 'text', required: true },
      { name: 'heirName', label: 'Heir Full Name', type: 'text', required: true },
      { name: 'heirId', label: 'Heir Omang Number', type: 'text', required: true },
      { name: 'relationship', label: 'Relationship to Deceased', type: 'text', required: true },
      { name: 'hasWill', label: 'Was there a will?', type: 'checkbox' },
      { name: 'bogosiLetter', label: 'Bogosi Confirmation Letter Attached', type: 'checkbox', required: true }
    ]
  },
  'Conversion Application Form': {
    steps: ['Applicant Details', 'Land Details', 'Payment'],
    fields: [
      { name: 'applicantName', label: 'Full Name', type: 'text', required: true },
      { name: 'idNumber', label: 'Omang Number', type: 'text', required: true },
      { name: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'], required: true },
      { name: 'plotNumber', label: 'Current Plot Number', type: 'text', required: true },
      { name: 'location', label: 'Plot Location', type: 'text', required: true },
      { name: 'currentUse', label: 'Current Land Use', type: 'select', options: ['Residential', 'Agricultural', 'Business'], required: true },
      { name: 'intendedUse', label: 'Intended Land Use', type: 'select', options: ['Residential', 'Agricultural', 'Business'], required: true },
      { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['Cash', 'Bank Transfer'], required: true }
    ]
  },
  'Common Law Application Form': {
    steps: ['Applicant Information', 'Land Details', 'Supporting Documents'],
    fields: [
      { name: 'applicantName', label: 'Full Name', type: 'text', required: true },
      { name: 'idNumber', label: 'Omang Number', type: 'text', required: true },
      { name: 'applicantType', label: 'Applicant Type', type: 'select', options: ['Individual', 'Company'], required: true },
      { name: 'landUse', label: 'Intended Land Use', type: 'select', options: ['Residential', 'Commercial', 'Agricultural', 'Industrial'], required: true },
      { name: 'preferredLocation', label: 'Preferred Location', type: 'text', required: true },
      { name: 'financialProof', label: 'Financial Proof Attached', type: 'checkbox', required: true }
    ]
  },
  'Customary Land Application Form': {
    steps: ['Personal Details', 'Land Requirements', 'Supporting Documents'],
    fields: [
      { name: 'applicantName', label: 'Full Name', type: 'text', required: true },
      { name: 'idNumber', label: 'Omang Number', type: 'text', required: true },
      { name: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'], required: true },
      { name: 'landPurpose', label: 'Purpose of Land', type: 'select', options: ['Residential', 'Agricultural', 'Cattle Post'], required: true },
      { name: 'plotSize', label: 'Requested Plot Size (hectares)', type: 'number', required: true },
      { name: 'village', label: 'Preferred Village/Area', type: 'text', required: true }
    ]
  }
};

const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services', icon: <HomeIcon /> },
  { id: 'certificate-management', label: 'Certificate Management', icon: <ReceiptIcon /> },
  { id: 'inheritance', label: 'Inheritance', icon: <AccountBalanceIcon /> },
  { id: 'land-conversion', label: 'Land Conversion', icon: <BusinessIcon /> },
  { id: 'land-application', label: 'Land Applications', icon: <MapIcon /> },
  { id: 'customary-land', label: 'Customary Land', icon: <PeopleIcon /> },
  { id: 'map-services', label: 'Map Services', icon: <MapIcon /> }
];

// ====================== COMPONENTS ======================
const ServiceCard = ({ service, onClick }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              {service.icon}
            </Avatar>
            <Typography variant="h6" component="div">
              {service.title}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {service.overview}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Chip label={`${service.duration} processing`} size="small" />
            <Chip label={service.cost} size="small" color="primary" />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const ServiceDetail = ({ service, onBack, onFormOpen }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [openVideo, setOpenVideo] = useState(false);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Services
      </Button>
      
      <Typography variant="h4" gutterBottom>
        {service.title}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Service Overview</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{service.overview}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Chip label={`Processing Time: ${service.duration}`} />
                <Chip label={`Cost: ${service.cost}`} color="primary" />
              </Box>
              {service.videoGuide && (
                <Button 
                  variant="outlined" 
                  startIcon={<VideoIcon />}
                  onClick={() => setOpenVideo(true)}
                  sx={{ mt: 2 }}
                >
                  Watch Video Guide
                </Button>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Process Steps</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stepper activeStep={activeStep} orientation="vertical">
                {service.steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel>{step}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={activeStep === service.steps.length - 1 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
                  disabled={activeStep === service.steps.length - 1}
                >
                  {activeStep === service.steps.length - 1 ? 'Completed' : 'Next'}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Eligibility Criteria</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {Array.isArray(service.eligibility) ? 
                  service.eligibility.map((item, i) => (
                    <ListItem key={i}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.light', width: 24, height: 24 }}>
                          <CheckCircleIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={item} />
                    </ListItem>
                  )) : 
                  <Typography>{service.eligibility}</Typography>}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Required Documents</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {service.requirements.map((doc, i) => (
                  <ListItem key={i}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.light' }}>
                        <AttachFileIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={doc} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {service.forms && service.forms.length > 0 && (
        <Accordion sx={{ mt: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Related Forms</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {service.forms.map((formName, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <FormIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography sx={{ flexGrow: 1 }}>{formName}</Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => onFormOpen(formName)}
                    >
                      Start
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {service.lawReference && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="subtitle2">Legal Reference:</Typography>
          <Typography>{service.lawReference}</Typography>
        </Alert>
      )}

      <Dialog open={openVideo} onClose={() => setOpenVideo(false)} maxWidth="md" fullWidth>
        <DialogTitle>Video Guide: {service.title}</DialogTitle>
        <DialogContent>
          <VideoPlayer src={service.videoGuide} title={service.title} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVideo(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const FormField = ({ field, value, onChange }) => {
  switch (field.type) {
    case 'select':
      return (
        <FormControl fullWidth margin="normal">
          <InputLabel>{field.label}</InputLabel>
          <Select
            value={value || ''}
            label={field.label}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
          >
            {field.options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={value || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
            />
          }
          label={field.label}
        />
      );
    default:
      return (
        <TextField
          fullWidth
          margin="normal"
          label={field.label}
          value={value || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
          type={field.type === 'number' ? 'number' : 'text'}
        />
      );
  }
};

const EnhancedInteractiveForm = ({ formName, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const formConfig = SERVICE_FORMS[formName];

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const resetForm = () => {
    setFormData({});
    setCurrentStep(0);
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Validate required fields
      const requiredFields = formConfig.fields.filter(f => f.required);
      const missingFields = requiredFields.filter(
        field => !formData[field.name] || formData[field.name] === ''
      );
      
      if (missingFields.length > 0) {
        throw new Error(
          `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`
        );
      }

      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      enqueueSnackbar('Form submitted successfully!', { 
        variant: 'success',
        autoHideDuration: 3000 
      });
      
      // Close form after delay
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(error.message);
      enqueueSnackbar(error.message || 'Failed to submit form', { 
        variant: 'error',
        autoHideDuration: 5000 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">{formName}</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      
      <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 3 }}>
        {formConfig.steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      
      <Box sx={{ p: 2 }}>
        {formConfig.fields
          .filter((_, index) => 
            index >= currentStep * Math.ceil(formConfig.fields.length / formConfig.steps.length) && 
            index < (currentStep + 1) * Math.ceil(formConfig.fields.length / formConfig.steps.length)
          )
          .map((field) => (
            <FormField 
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={handleFieldChange}
            />
          ))}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          disabled={currentStep === 0 || isSubmitting}
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
        {currentStep === formConfig.steps.length - 1 ? (
          <Button 
            variant="contained"
            onClick={handleSubmit}
            endIcon={submitSuccess ? <CheckCircleIcon /> : <SendIcon />}
            disabled={isSubmitting || submitSuccess}
            sx={{
              minWidth: 120,
              ...(submitSuccess && {
                bgcolor: 'success.main',
                '&:hover': { bgcolor: 'success.dark' }
              })
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Submitting...
              </>
            ) : submitSuccess ? (
              'Submitted!'
            ) : (
              'Submit'
            )}
          </Button>
        ) : (
          <Button 
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
            disabled={isSubmitting}
          >
            Next
          </Button>
        )}
      </Box>
    </Paper>
  );
};

const ServiceCategoryFilter = ({ categories, activeCategory, onChange }) => {
  return (
    <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, mb: 3, py: 1 }}>
      {categories.map((category) => (
        <Chip
          key={category.id}
          icon={category.icon}
          label={category.label}
          onClick={() => onChange(category.id)}
          color={activeCategory === category.id ? 'primary' : 'default'}
          variant={activeCategory === category.id ? 'filled' : 'outlined'}
          sx={{ flexShrink: 0 }}
        />
      ))}
    </Box>
  );
};

const UpdateTracker = ({ changes }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <UpdateIcon color="warning" />
        <Typography variant="h6" sx={{ ml: 1 }}>Recent Updates</Typography>
      </Box>
      <List>
        {changes.map((change, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar>{index + 1}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={change.title}
              secondary={
                <>
                  <Typography component="span">{change.summary}</Typography>
                  <br />
                  <Typography variant="caption">
                    {new Date(change.date).toLocaleDateString()}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const VideoPlayer = ({ src, title }) => {
  return (
    <Box sx={{ 
      width: '100%',
      height: 400,
      bgcolor: 'black',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      mb: 3
    }}>
      <VideoIcon sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h6">{title || 'Video Player'}</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>{src}</Typography>
    </Box>
  );
};

const LawTimeline = ({ legislation }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Legislative Timeline
      </Typography>
      <List>
        {legislation?.length > 0 ? (
          legislation.map((law, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar>
                  <LawIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={law.title}
                secondary={new Date(law.date).toLocaleDateString()}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No related legislation
          </Typography>
        )}
      </List>
    </Paper>
  );
};

const LawUpdates = ({ updates }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ArticleIcon color="info" />
        <Typography variant="h6" sx={{ ml: 1 }}>Legislative Updates</Typography>
      </Box>
      <List>
        {updates?.length > 0 ? (
          updates.map((update, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <UpdateIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={update.title}
                secondary={
                  <>
                    <Typography component="span">{update.summary}</Typography>
                    <br />
                    <Typography variant="caption">
                      {new Date(update.date).toLocaleDateString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No recent updates
          </Typography>
        )}
      </List>
    </Paper>
  );
};

const SearchResources = ({ onSearch, placeholder }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        InputProps={{
          startAdornment: <SearchIcon />
        }}
      />
      <Button 
        variant="contained" 
        onClick={handleSearch}
        startIcon={<SearchIcon />}
      >
        Search
      </Button>
    </Box>
  );
};

// ====================== MAIN COMPONENT ======================
const EducationPortal = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [laws, setLaws] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLaws([
          { id: 1, title: 'Land Act 2020', type: 'primary', date: '2020-01-15' },
          { id: 2, title: 'Lease Application Guide', type: 'guideline', date: '2021-03-22' },
          { id: 3, title: 'Property Transfer Form', type: 'form', date: '2022-05-10' },
          { id: 4, title: 'Land Rights Video Tutorial', type: 'video', date: '2022-07-30' }
        ]);
        
        setUpdates([
          { id: 1, title: 'Amendment to Section 5', summary: 'Updated requirements for land transfers', date: '2023-01-10' },
          { id: 2, title: 'New Registration Process', summary: 'Digital registration now available', date: '2023-02-15' }
        ]);
        
        setLoading(false);
      } catch (error) {
        setError(error.message || 'Failed to load data');
        setLoading(false);
        enqueueSnackbar('Failed to load portal data', { variant: 'error' });
      }
    };

    fetchData();
  }, [enqueueSnackbar]);

  const filteredServices = LAND_SERVICES.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.overview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            Botswana Land Services Portal
          </Typography>
          
          {activeForm ? (
            <EnhancedInteractiveForm 
              formName={activeForm} 
              onClose={() => setActiveForm(null)}
            />
          ) : selectedService ? (
            <ServiceDetail 
              service={selectedService} 
              onBack={() => setSelectedService(null)}
              onFormOpen={setActiveForm}
            />
          ) : (
            <>
              <SearchResources 
                onSearch={setSearchQuery}
                placeholder="Search land services..."
              />
              
              <ServiceCategoryFilter 
                categories={SERVICE_CATEGORIES}
                activeCategory={activeCategory}
                onChange={setActiveCategory}
              />
              
              <Grid container spacing={3}>
                {filteredServices.map(service => (
                  <Grid item xs={12} sm={6} key={service.id}>
                    <ServiceCard 
                      service={service}
                      onClick={() => setSelectedService(service)}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {filteredServices.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No services found matching your search criteria
                </Alert>
              )}
            </>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <UpdateTracker changes={updates} />
            <LawUpdates updates={updates} />
            <LawTimeline legislation={laws.filter(law => law.type === 'primary')} />
            
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Land Services Assistant
              </Typography>
              <Box sx={{ height: 400 }}>
                <Chatbot config={chatbotConfig} />
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EducationPortal;