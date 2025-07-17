/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    AttachFile,
    Business,
    Folder,
    Gavel,
    Person,
    Send,
    VerifiedUser,
    Warning
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box, Button, Card, CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    List, ListItem, ListItemText,
    MenuItem,
    Paper,
    Select,
    Step, StepLabel,
    Stepper,
    Table, TableBody, TableCell, TableContainer, TableRow,
    TextField, Typography
} from '@mui/material';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import { useState } from 'react';
import Dropzone from 'react-dropzone';
import * as Yup from 'yup';

// Validation Schema
const appealSchema = Yup.object().shape({
  appealType: Yup.string().required('Required'),
  appellantType: Yup.string().required('Required'),
  fullName: Yup.string().required('Required'),
  idNumber: Yup.string().required('Required'),
  contactNumber: Yup.string()
    .matches(/^\+267\d{7}$/, 'Invalid Botswana number')
    .required('Required'),
  email: Yup.string().email('Invalid email'),
  resolutionLetter: Yup.mixed().required('Resolution letter is required'),
  landDocument: Yup.mixed().when('appealType', {
    is: 'land',
    then: Yup.mixed().required('Land document is required')
  }),
  planningDocuments: Yup.mixed().when('appealType', {
    is: 'planning',
    then: Yup.mixed().required('Planning documents are required')
  }),
  sketchPlan: Yup.mixed().when('appealType', {
    is: 'land',
    then: Yup.mixed().required('Sketch plan is required')
  }),
  authorizedRepresentative: Yup.boolean(),
  representativeDetails: Yup.object().when('authorizedRepresentative', {
    is: true,
    then: Yup.object().shape({
      name: Yup.string().required('Representative name required'),
      authorityLetter: Yup.mixed().required('Letter of authority required'),
      contact: Yup.string().required('Representative contact required')
    })
  })
});

const AppealFormStepper = ({ activeStep, steps }) => (
  <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
    {steps.map((label) => (
      <Step key={label}>
        <StepLabel>{label}</StepLabel>
      </Step>
    ))}
  </Stepper>
);

const FilePreview = ({ files, onRemove, label }) => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2">{label}</Typography>
    <List dense sx={{ maxHeight: 150, overflow: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
      {files.map((file, index) => (
        <ListItem 
          key={index} 
          secondaryAction={
            <IconButton edge="end" onClick={() => onRemove(index)} size="small">
              <Warning color="error" />
            </IconButton>
          }
        >
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <AttachFile />
          </Avatar>
          <ListItemText 
            primary={file.name} 
            secondary={`${(file.size/1024).toFixed(1)} KB`} 
          />
          <Chip label={file.type.split('/')[0] || file.type} size="small" />
        </ListItem>
      ))}
    </List>
  </Box>
);

const ReviewSection = ({ title, values }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
      {title === 'Appellant Details' && <Person sx={{ mr: 1 }} />}
      {title === 'Appeal Information' && <Gavel sx={{ mr: 1 }} />}
      {title === 'Documents' && <Folder sx={{ mr: 1 }} />}
      {title === 'Representative' && <Business sx={{ mr: 1 }} />}
      {title}
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableBody>
          {Object.entries(values).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>
                {key.split(/(?=[A-Z])/).join(' ')}
              </TableCell>
              <TableCell>
                {Array.isArray(value) ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {value.map((file, i) => (
                      <Chip 
                        key={i} 
                        label={file.name} 
                        size="small" 
                        icon={<AttachFile />}
                      />
                    ))}
                  </Box>
                ) : typeof value === 'object' ? (
                  <ReviewSection 
                    title={`${key} Details`} 
                    values={value} 
                    sx={{ p: 0, boxShadow: 'none' }} 
                  />
                ) : (
                  value.toString()
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default function LandTribunalAppeal() {
  const [activeStep, setActiveStep] = useState(0);
  const [caseNumber, setCaseNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileErrors, setFileErrors] = useState({});
  
  const formik = useFormik({
    initialValues: {
      appealType: '',
      appellantType: 'individual',
      fullName: '',
      idNumber: '',
      contactNumber: '+267',
      email: '',
      physicalAddress: '',
      postalAddress: '',
      resolutionLetter: [],
      landDocument: [],
      planningDocuments: [],
      sketchPlan: [],
      description: '',
      authorizedRepresentative: false,
      representativeDetails: {
        name: '',
        contact: '',
        authorityLetter: []
      },
      organizationDetails: {
        name: '',
        registrationNumber: '',
        resolutionLetter: [],
        certificate: [],
        constitution: []
      }
    },
    validationSchema: appealSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate mock case number
        const newCaseNumber = `LT-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
        setCaseNumber(newCaseNumber);
        setActiveStep(3);
        
        // In production, you would submit to an actual API endpoint
        // const formData = new FormData();
        // Object.entries(values).forEach(([key, value]) => {
        //   if (Array.isArray(value)) {
        //     value.forEach(file => formData.append(key, file));
        //   } else if (typeof value === 'object') {
        //     formData.append(key, JSON.stringify(value));
        //   } else {
        //     formData.append(key, value);
        //   }
        // });
        // const response = await fetch('/api/land-tribunal/appeals', {
        //   method: 'POST',
        //   body: formData
        // });
        // const result = await response.json();
        // if (response.ok) {
        //   setCaseNumber(result.caseNumber);
        //   setActiveStep(3);
        // }
      } catch (error) {
        console.error('Submission error:', error);
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    }
  });

  const steps = ['Appellant Details', 'Appeal Information', 'Review & Submit'];
  
  const handleNext = () => {
    // Validate current step before proceeding
    const errors = {};
    let isValid = true;
    
    if (activeStep === 0) {
      if (!formik.values.fullName) {
        errors.fullName = 'Required';
        isValid = false;
      }
      if (!formik.values.idNumber) {
        errors.idNumber = 'Required';
        isValid = false;
      }
    }
    
    if (activeStep === 1) {
      if (!formik.values.appealType) {
        errors.appealType = 'Required';
        isValid = false;
      }
      if (formik.values.appealType === 'land' && formik.values.landDocument.length === 0) {
        errors.landDocument = 'Required';
        isValid = false;
      }
      if (formik.values.appealType === 'planning' && formik.values.planningDocuments.length === 0) {
        errors.planningDocuments = 'Required';
        isValid = false;
      }
      if (formik.values.resolutionLetter.length === 0) {
        errors.resolutionLetter = 'Required';
        isValid = false;
      }
    }
    
    if (isValid) {
      setActiveStep(prev => Math.min(prev + 1, 2));
    } else {
      formik.setErrors(errors);
    }
  };
  
  const handleBack = () => setActiveStep(prev => Math.max(prev - 1, 0));
  
  const handleFileDrop = (fieldName, acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      setFileErrors(prev => ({
        ...prev,
        [fieldName]: `File too large or invalid type. Max size: 5MB, allowed types: PDF, JPG, PNG`
      }));
    } else {
      setFileErrors(prev => ({ ...prev, [fieldName]: null }));
      formik.setFieldValue(fieldName, [
        ...formik.values[fieldName],
        ...acceptedFiles
      ]);
    }
  };
  
  const removeFile = (fieldName, index) => {
    const updatedFiles = [...formik.values[fieldName]];
    updatedFiles.splice(index, 1);
    formik.setFieldValue(fieldName, updatedFiles);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Gavel color="primary" sx={{ mr: 2 }} />
            Land Tribunal Appeal Submission
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Submit your appeal against decisions of the Minister, Land Boards, or Planning Authorities
          </Typography>
          
          <AppealFormStepper activeStep={activeStep} steps={steps} />

          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="appellant-type-label">Appellant Type</InputLabel>
                  <Select
                    labelId="appellant-type-label"
                    id="appellantType"
                    name="appellantType"
                    value={formik.values.appellantType}
                    onChange={formik.handleChange}
                    label="Appellant Type"
                  >
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="company">Company/Organization</MenuItem>
                    <MenuItem value="estate">Deceased Estate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="idNumber"
                  name="idNumber"
                  label={formik.values.appellantType === 'individual' ? 'Omang/Passport Number' : 'Registration Number'}
                  value={formik.values.idNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.idNumber && Boolean(formik.errors.idNumber)}
                  helperText={formik.touched.idNumber && formik.errors.idNumber}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="contactNumber"
                  name="contactNumber"
                  label="Contact Number"
                  value={formik.values.contactNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.contactNumber && Boolean(formik.errors.contactNumber)}
                  helperText={formik.touched.contactNumber && formik.errors.contactNumber}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email (Optional)"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              
              {formik.values.appellantType === 'company' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                      Organization Details
                    </Typography>
                    <Divider />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="organizationDetails.name"
                      name="organizationDetails.name"
                      label="Organization Name"
                      value={formik.values.organizationDetails.name}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Dropzone
                      onDrop={(acceptedFiles, rejectedFiles) => 
                        handleFileDrop('organizationDetails.certificate', acceptedFiles, rejectedFiles)
                      }
                      accept={['application/pdf']}
                      maxSize={5 * 1024 * 1024}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <Box {...getRootProps()} sx={{ p: 2, border: '2px dashed', mt: 2 }}>
                          <input {...getInputProps()} />
                          <Typography align="center">
                            Upload Certificate of Incorporation/Registration
                          </Typography>
                        </Box>
                      )}
                    </Dropzone>
                    {formik.values.organizationDetails.certificate.length > 0 && (
                      <FilePreview
                        files={formik.values.organizationDetails.certificate}
                        onRemove={(index) => removeFile('organizationDetails.certificate', index)}
                        label="Certificate of Incorporation/Registration"
                      />
                    )}
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.authorizedRepresentative}
                      onChange={(e) => {
                        formik.setFieldValue('authorizedRepresentative', e.target.checked);
                        if (!e.target.checked) {
                          formik.setFieldValue('representativeDetails', {
                            name: '',
                            contact: '',
                            authorityLetter: []
                          });
                        }
                      }}
                      name="authorizedRepresentative"
                    />
                  }
                  label="I am filing this appeal through an authorized representative"
                />
              </Grid>
              
              {formik.values.authorizedRepresentative && (
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid #eee' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Representative Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          id="representativeDetails.name"
                          name="representativeDetails.name"
                          label="Representative Name"
                          value={formik.values.representativeDetails.name}
                          onChange={formik.handleChange}
                          error={Boolean(
                            formik.touched.representativeDetails?.name && 
                            formik.errors.representativeDetails?.name
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          id="representativeDetails.contact"
                          name="representativeDetails.contact"
                          label="Representative Contact"
                          value={formik.values.representativeDetails.contact}
                          onChange={formik.handleChange}
                          error={Boolean(
                            formik.touched.representativeDetails?.contact && 
                            formik.errors.representativeDetails?.contact
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Dropzone
                          onDrop={(acceptedFiles, rejectedFiles) => 
                            handleFileDrop('representativeDetails.authorityLetter', acceptedFiles, rejectedFiles)
                          }
                          accept={['application/pdf']}
                          maxSize={5 * 1024 * 1024}
                        >
                          {({ getRootProps, getInputProps }) => (
                            <Box {...getRootProps()} sx={{ p: 2, border: '2px dashed', mt: 2 }}>
                              <input {...getInputProps()} />
                              <Typography align="center">
                                Upload Letter of Authority
                              </Typography>
                            </Box>
                          )}
                        </Dropzone>
                        {formik.values.representativeDetails.authorityLetter.length > 0 && (
                          <FilePreview
                            files={formik.values.representativeDetails.authorityLetter}
                            onRemove={(index) => removeFile('representativeDetails.authorityLetter', index)}
                            label="Letter of Authority"
                          />
                        )}
                        {fileErrors.representativeDetails?.authorityLetter && (
                          <FormHelperText error>
                            {fileErrors.representativeDetails.authorityLetter}
                          </FormHelperText>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={formik.touched.appealType && Boolean(formik.errors.appealType)}>
                  <InputLabel id="appeal-type-label">Type of Appeal</InputLabel>
                  <Select
                    labelId="appeal-type-label"
                    id="appealType"
                    name="appealType"
                    value={formik.values.appealType}
                    onChange={formik.handleChange}
                    label="Type of Appeal"
                  >
                    <MenuItem value="land">Land Board Decision</MenuItem>
                    <MenuItem value="planning">Planning Authority Decision</MenuItem>
                    <MenuItem value="minister">Minister&apos;s Decision</MenuItem>
                  </Select>
                  {formik.touched.appealType && formik.errors.appealType && (
                    <FormHelperText>{formik.errors.appealType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Dropzone
                  onDrop={(acceptedFiles, rejectedFiles) => 
                    handleFileDrop('resolutionLetter', acceptedFiles, rejectedFiles)
                  }
                  accept={['application/pdf', 'image/*']}
                  maxSize={5 * 1024 * 1024}
                >
                  {({ getRootProps, getInputProps }) => (
                    <Box {...getRootProps()} sx={{ p: 3, border: '2px dashed', mt: 2 }}>
                      <input {...getInputProps()} />
                      <Typography align="center">
                        Upload Resolution Letter from {formik.values.appealType === 'land' ? 'Land Board' : 
                          formik.values.appealType === 'planning' ? 'Planning Authority' : 'Minister'}
                      </Typography>
                    </Box>
                  )}
                </Dropzone>
                {formik.values.resolutionLetter.length > 0 && (
                  <FilePreview
                    files={formik.values.resolutionLetter}
                    onRemove={(index) => removeFile('resolutionLetter', index)}
                    label="Resolution Letter"
                  />
                )}
                {fileErrors.resolutionLetter && (
                  <FormHelperText error>{fileErrors.resolutionLetter}</FormHelperText>
                )}
                {formik.touched.resolutionLetter && formik.errors.resolutionLetter && (
                  <FormHelperText error>{formik.errors.resolutionLetter}</FormHelperText>
                )}
              </Grid>
              
              {formik.values.appealType === 'land' && (
                <>
                  <Grid item xs={12}>
                    <Dropzone
                      onDrop={(acceptedFiles, rejectedFiles) => 
                        handleFileDrop('landDocument', acceptedFiles, rejectedFiles)
                      }
                      accept={['application/pdf']}
                      maxSize={5 * 1024 * 1024}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <Box {...getRootProps()} sx={{ p: 3, border: '2px dashed' }}>
                          <input {...getInputProps()} />
                          <Typography align="center">
                            Upload Land Document (Lease, Title Deed, or Customary Grant)
                          </Typography>
                        </Box>
                      )}
                    </Dropzone>
                    {formik.values.landDocument.length > 0 && (
                      <FilePreview
                        files={formik.values.landDocument}
                        onRemove={(index) => removeFile('landDocument', index)}
                        label="Land Document"
                      />
                    )}
                    {fileErrors.landDocument && (
                      <FormHelperText error>{fileErrors.landDocument}</FormHelperText>
                    )}
                    {formik.touched.landDocument && formik.errors.landDocument && (
                      <FormHelperText error>{formik.errors.landDocument}</FormHelperText>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Dropzone
                      onDrop={(acceptedFiles, rejectedFiles) => 
                        handleFileDrop('sketchPlan', acceptedFiles, rejectedFiles)
                      }
                      accept={['image/*', 'application/pdf']}
                      maxSize={5 * 1024 * 1024}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <Box {...getRootProps()} sx={{ p: 3, border: '2px dashed' }}>
                          <input {...getInputProps()} />
                          <Typography align="center">
                            Upload Sketch Plan of the Disputed Area
                          </Typography>
                        </Box>
                      )}
                    </Dropzone>
                    {formik.values.sketchPlan.length > 0 && (
                      <FilePreview
                        files={formik.values.sketchPlan}
                        onRemove={(index) => removeFile('sketchPlan', index)}
                        label="Sketch Plan"
                      />
                    )}
                    {fileErrors.sketchPlan && (
                      <FormHelperText error>{fileErrors.sketchPlan}</FormHelperText>
                    )}
                    {formik.touched.sketchPlan && formik.errors.sketchPlan && (
                      <FormHelperText error>{formik.errors.sketchPlan}</FormHelperText>
                    )}
                  </Grid>
                </>
              )}
              
              {formik.values.appealType === 'planning' && (
                <Grid item xs={12}>
                  <Dropzone
                    onDrop={(acceptedFiles, rejectedFiles) => 
                      handleFileDrop('planningDocuments', acceptedFiles, rejectedFiles)
                    }
                    accept={['application/pdf', 'image/*']}
                    maxSize={5 * 1024 * 1024}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <Box {...getRootProps()} sx={{ p: 3, border: '2px dashed' }}>
                        <input {...getInputProps()} />
                        <Typography align="center">
                          Upload Planning Documents (Drawings, Consultation Forms, etc.)
                        </Typography>
                      </Box>
                    )}
                  </Dropzone>
                  {formik.values.planningDocuments.length > 0 && (
                    <FilePreview
                      files={formik.values.planningDocuments}
                      onRemove={(index) => removeFile('planningDocuments', index)}
                      label="Planning Documents"
                    />
                  )}
                  {fileErrors.planningDocuments && (
                    <FormHelperText error>{fileErrors.planningDocuments}</FormHelperText>
                  )}
                  {formik.touched.planningDocuments && formik.errors.planningDocuments && (
                    <FormHelperText error>{formik.errors.planningDocuments}</FormHelperText>
                  )}
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Grounds for Appeal"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={
                    formik.touched.description && formik.errors.description
                      ? formik.errors.description
                      : "Clearly state why you are appealing the decision"
                  }
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please review all information before submitting. You can go back to make changes if needed.
              </Alert>
              
              <ReviewSection 
                title="Appellant Details" 
                values={{
                  'Appellant Type': formik.values.appellantType,
                  'Full Name': formik.values.fullName,
                  'ID Number': formik.values.idNumber,
                  'Contact Number': formik.values.contactNumber,
                  'Email': formik.values.email || 'Not provided',
                  'Authorized Representative': formik.values.authorizedRepresentative ? 'Yes' : 'No',
                  ...(formik.values.authorizedRepresentative ? {
                    'Representative Name': formik.values.representativeDetails.name,
                    'Representative Contact': formik.values.representativeDetails.contact
                  } : {}),
                  ...(formik.values.appellantType === 'company' ? {
                    'Organization Name': formik.values.organizationDetails.name
                  } : {})
                }} 
              />
              
              <ReviewSection 
                title="Appeal Information" 
                values={{
                  'Appeal Type': formik.values.appealType === 'land' ? 'Land Board Decision' :
                    formik.values.appealType === 'planning' ? 'Planning Authority Decision' : "Minister's Decision",
                  'Grounds for Appeal': formik.values.description
                }} 
              />
              
              <ReviewSection 
                title="Documents" 
                values={{
                  'Resolution Letter': formik.values.resolutionLetter,
                  ...(formik.values.appealType === 'land' ? {
                    'Land Document': formik.values.landDocument,
                    'Sketch Plan': formik.values.sketchPlan
                  } : {}),
                  ...(formik.values.appealType === 'planning' ? {
                    'Planning Documents': formik.values.planningDocuments
                  } : {}),
                  ...(formik.values.authorizedRepresentative ? {
                    'Letter of Authority': formik.values.representativeDetails.authorityLetter
                  } : {}),
                  ...(formik.values.appellantType === 'company' ? {
                    'Certificate of Registration': formik.values.organizationDetails.certificate
                  } : {})
                }} 
              />
              
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <Warning color="warning" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Important Notes
                </Typography>
                <Typography variant="body2" paragraph>
                  1. All documents should be submitted in triplicate (3 copies).
                </Typography>
                <Typography variant="body2" paragraph>
                  2. The appeal fee of BWP 10.00 will be collected at the Land Tribunal office when you submit physical copies.
                </Typography>
                <Typography variant="body2" paragraph>
                  3. Processing time for appeals is typically within 12 months from submission date.
                </Typography>
                <Typography variant="body2">
                  4. You will be notified of hearing dates and further requirements via the contact information provided.
                </Typography>
              </Box>
              
              <FormControlLabel
                control={<Checkbox required />}
                label="I declare that the information provided is true and correct to the best of my knowledge"
                sx={{ mt: 3 }}
              />
            </Box>
          )}

          {activeStep === 3 && (
            <Alert 
              icon={<VerifiedUser fontSize="large" />} 
              severity="success" 
              sx={{ mb: 3 }}
            >
              <Typography variant="h5" gutterBottom>
                Appeal Submitted Successfully
              </Typography>
              <Typography paragraph>
                Your appeal has been registered with case number: <strong>{caseNumber}</strong>
              </Typography>
              <Typography paragraph>
                Please visit one of the Land Tribunal offices in Gaborone, Maun, Francistown, or Palapye 
                within 7 working days to complete the submission process and pay the BWP 10.00 fee.
              </Typography>
              <Typography>
                You will receive further communication regarding your appeal via the contact details provided.
              </Typography>
            </Alert>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            {activeStep < 3 && (
              <>
                <Button 
                  variant="outlined"
                  disabled={activeStep === 0 || isSubmitting}
                  onClick={handleBack}
                  startIcon={<Send />}
                >
                  Back
                </Button>
                
                <Button
                  variant="contained"
                  onClick={activeStep === 2 ? formik.submitForm : handleNext}
                  disabled={isSubmitting}
                  endIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
                >
                  {activeStep === 2 ? 'Submit Appeal' : 'Next'}
                </Button>
              </>
            )}
            
            {activeStep === 3 && (
              <Button
                variant="contained"
                onClick={() => {
                  formik.resetForm();
                  setActiveStep(0);
                }}
              >
                Submit Another Appeal
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          For assistance, please contact the Land Tribunal offices in Gaborone, Maun, Francistown, or Palapye
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Opening hours: 07:30 to 12:45 and 13:45 to 16:30, Monday to Friday (excluding public holidays)
        </Typography>
      </Box>
    </Container>
  );
}