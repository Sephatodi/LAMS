/** @jsxRuntime classic */
/** @jsx React.createElement */

// components/land-application/ApplyForLand/index.js
import { CheckCircle, CloudUpload } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Container,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    Grid,
    InputAdornment,
    MenuItem,
    Radio,
    RadioGroup,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import useLandApplication from '../hooks/useLandApplication';
import FilePreview from './FilePreview';

// Form steps configuration
const steps = ['Personal Information', 'Land Details', 'Declaration', 'Review & Submit'];

// Customary land use options
const LAND_USE_OPTIONS = [
  { value: 'residential', label: 'Residential' },
  { value: 'ploughing', label: 'Ploughing/Agriculture' },
  { value: 'cemetery', label: 'Cemetery' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'grazing', label: 'Grazing' },
  { value: 'other', label: 'Other (specify)' }
];

// Marital status options
const MARITAL_STATUS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' }
];

// File validation schema
const fileSchema = Yup.mixed()
  .required('This file is required')
  .test('fileSize', 'File too large (max 5MB)', (value) => 
    !value || (value && value.size <= 5 * 1024 * 1024)
  )
  .test('fileType', 'Invalid file type (JPEG, PNG, PDF only)', (value) => 
    !value || (value && ['image/jpeg', 'image/png', 'application/pdf'].includes(value.type))
  );

const ApplyForLand = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [otherLandRights, setOtherLandRights] = useState([{ location: '', size: '', developed: false }]);
  const [borderingLandOwners, setBorderingLandOwners] = useState(['']);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { submitApplication, loading, error, success } = useLandApplication();

  // Formik initialization with enhanced validation
  const formik = useFormik({
    initialValues: {
      // Personal Information
      fullName: '',
      nationalId: '',
      dateOfBirth: null,
      age: '',
      gender: '',
      citizenship: 'citizen',
      idNumber: '',
      maritalStatus: '',
      spouseName: '',
      email: '',
      phone: '',
      postalAddress: '',
      
      // Land Details
      plotLocation: '',
      currentUse: '',
      landSize: '',
      landUnit: 'hectares',
      proposedUse: 'residential',
      otherUse: '',
      debushed: false,
      
      // Supporting Documents
      idCopy: null,
      proofOfResidence: null,
      sitePlan: null,
      otherDocuments: null,
      
      // Metadata
      applicationDate: new Date(),
      applicationType: 'customary'
    },
    validationSchema: Yup.object().shape({
      // Personal Information
      fullName: Yup.string().required('Full name is required'),
      nationalId: Yup.string().required('National ID is required'),
      dateOfBirth: Yup.date().required('Date of birth is required').nullable(),
      gender: Yup.string().required('Gender is required'),
      maritalStatus: Yup.string().required('Marital status is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      phone: Yup.string().required('Phone number is required'),
      postalAddress: Yup.string().required('Postal address is required'),
      
      // Land Details
      plotLocation: Yup.string().required('Plot location is required'),
      currentUse: Yup.string().required('Current use is required'),
      landSize: Yup.number().required('Land size is required').positive('Must be positive'),
      proposedUse: Yup.string().required('Proposed use is required'),
      
      // Supporting Documents
      idCopy: fileSchema,
      proofOfResidence: fileSchema,
      sitePlan: fileSchema,
      otherDocuments: Yup.mixed(),
      
      // Conditional validation
      spouseName: Yup.string().when('maritalStatus', {
        is: 'married',
        then: Yup.string().required('Spouse name is required for married applicants')
      }),
      otherUse: Yup.string().when('proposedUse', {
        is: 'other',
        then: Yup.string().required('Please specify the proposed use')
      })
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      
      // Append all form values to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      
      // Append dynamic fields
      otherLandRights.forEach((right, index) => {
        formData.append(`otherLandRights[${index}]`, JSON.stringify(right));
      });
      
      borderingLandOwners.forEach((owner, index) => {
        formData.append(`borderingLandOwners[${index}]`, owner);
      });
      
      const success = await submitApplication(formData);
      if (success) {
        setActiveStep(activeStep + 1);
        setTimeout(() => {
          navigate('/land-records', {
            state: {
              applicationId: `TL-APP-${Math.floor(Math.random() * 10000)}`,
              success: true
            }
          });
        }, 2000);
      }
    },
  });

  // File handling functions
  const handleRemoveFile = (fieldName) => () => {
    formik.setFieldValue(fieldName, null);
    formik.setFieldTouched(fieldName, false);
  };

  const handleFileChange = (fieldName) => (event) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      formik.setFieldValue(fieldName, file);
      formik.setFieldTouched(fieldName, true);
    }
  };

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formik.values.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formik.values.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      formik.setFieldValue('age', age);
    }
  }, [formik, formik.values.dateOfBirth]);

  // Dynamic field handlers
  const handleAddLandRight = () => {
    setOtherLandRights([...otherLandRights, { location: '', size: '', developed: false }]);
  };

  const handleRemoveLandRight = (index) => {
    const newRights = [...otherLandRights];
    newRights.splice(index, 1);
    setOtherLandRights(newRights);
  };

  const handleLandRightChange = (index, field, value) => {
    const newRights = [...otherLandRights];
    newRights[index][field] = value;
    setOtherLandRights(newRights);
  };

  const handleAddBorderingOwner = () => {
    setBorderingLandOwners([...borderingLandOwners, '']);
  };

  const handleRemoveBorderingOwner = (index) => {
    const newOwners = [...borderingLandOwners];
    newOwners.splice(index, 1);
    setBorderingLandOwners(newOwners);
  };

  const handleBorderingOwnerChange = (index, value) => {
    const newOwners = [...borderingLandOwners];
    newOwners[index] = value;
    setBorderingLandOwners(newOwners);
  };

  // Form navigation handlers
  const handleNext = async () => {
    // Validate current step before proceeding
    const stepFields = {
      0: ['fullName', 'nationalId', 'dateOfBirth', 'gender', 'citizenship', 'idNumber', 'maritalStatus', 'email', 'phone', 'postalAddress'],
      1: ['plotLocation', 'currentUse', 'landSize', 'proposedUse', 'idCopy', 'proofOfResidence', 'sitePlan'],
      2: ['declarationAccepted']
    };

    // Mark fields as touched
    stepFields[activeStep]?.forEach(field => {
      formik.setFieldTouched(field, true, false);
    });

    // Check for errors
    const _isValid = await formik.validateForm();
    const hasErrors = stepFields[activeStep]?.some(
      field => formik.errors[field] && formik.touched[field]
    );

    if (!hasErrors) {
      setActiveStep(activeStep + 1);
    } else {
      scrollToFirstError();
    }
  };

  const scrollToFirstError = () => {
    const firstError = Object.keys(formik.errors)[0];
    if (firstError) {
      document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const handleBack = () => setActiveStep(activeStep - 1);
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this application?')) {
      navigate('/citizen-dashboard');
    }
  };

  // Step content components
  const PersonalInfoStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fullName && Boolean(formik.errors.fullName)}
          helperText={formik.touched.fullName && formik.errors.fullName}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="National ID/Omang Number"
          name="nationalId"
          value={formik.values.nationalId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.nationalId && Boolean(formik.errors.nationalId)}
          helperText={formik.touched.nationalId && formik.errors.nationalId}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <DatePicker
          label="Date of Birth"
          value={formik.values.dateOfBirth}
          onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
          slotProps={{
            textField: {
              fullWidth: true,
              error: formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth),
              helperText: formik.touched.dateOfBirth && formik.errors.dateOfBirth
            }
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Age"
          name="age"
          value={formik.values.age}
          InputProps={{
            readOnly: true,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Gender</FormLabel>
          <RadioGroup
            row
            name="gender"
            value={formik.values.gender}
            onChange={formik.handleChange}
          >
            <FormControlLabel value="male" control={<Radio />} label="Male" />
            <FormControlLabel value="female" control={<Radio />} label="Female" />
          </RadioGroup>
          {formik.touched.gender && formik.errors.gender && (
            <FormHelperText error>{formik.errors.gender}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Are you a citizen of Botswana?</FormLabel>
          <RadioGroup
            row
            name="citizenship"
            value={formik.values.citizenship}
            onChange={formik.handleChange}
          >
            <FormControlLabel value="citizen" control={<Radio />} label="Yes" />
            <FormControlLabel value="non-citizen" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Marital Status"
          name="maritalStatus"
          select
          value={formik.values.maritalStatus}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.maritalStatus && Boolean(formik.errors.maritalStatus)}
          helperText={formik.touched.maritalStatus && formik.errors.maritalStatus}
        >
          {MARITAL_STATUS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      
      {formik.values.maritalStatus === 'married' && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Spouse Name"
            name="spouseName"
            value={formik.values.spouseName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.spouseName && Boolean(formik.errors.spouseName)}
            helperText={formik.touched.spouseName && formik.errors.spouseName}
          />
        </Grid>
      )}
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone Number"
          name="phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phone && Boolean(formik.errors.phone)}
          helperText={formik.touched.phone && formik.errors.phone}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Postal Address"
          name="postalAddress"
          multiline
          rows={3}
          value={formik.values.postalAddress}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.postalAddress && Boolean(formik.errors.postalAddress)}
          helperText={formik.touched.postalAddress && formik.errors.postalAddress}
        />
      </Grid>
    </Grid>
  );

  const LandDetailsStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Name of place where plot is located"
          name="plotLocation"
          value={formik.values.plotLocation}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.plotLocation && Boolean(formik.errors.plotLocation)}
          helperText={formik.touched.plotLocation && formik.errors.plotLocation}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Current use of the plot"
          name="currentUse"
          value={formik.values.currentUse}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.currentUse && Boolean(formik.errors.currentUse)}
          helperText={formik.touched.currentUse && formik.errors.currentUse}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Size of plot applied for"
          name="landSize"
          type="number"
          value={formik.values.landSize}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.landSize && Boolean(formik.errors.landSize)}
          helperText={formik.touched.landSize && formik.errors.landSize}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <TextField
                  select
                  variant="standard"
                  name="landUnit"
                  value={formik.values.landUnit}
                  onChange={formik.handleChange}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="hectares">Hectares</MenuItem>
                  <MenuItem value="acres">Acres</MenuItem>
                  <MenuItem value="square-meters">Square Meters</MenuItem>
                </TextField>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formik.values.debushed}
              onChange={formik.handleChange}
              name="debushed"
              color="primary"
            />
          }
          label="Is the site applied for debushed?"
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Proposed use of the land"
          name="proposedUse"
          select
          value={formik.values.proposedUse}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.proposedUse && Boolean(formik.errors.proposedUse)}
          helperText={formik.touched.proposedUse && formik.errors.proposedUse}
        >
          {LAND_USE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      
      {formik.values.proposedUse === 'other' && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Specify proposed use"
            name="otherUse"
            value={formik.values.otherUse}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.otherUse && Boolean(formik.errors.otherUse)}
            helperText={formik.touched.otherUse && formik.errors.otherUse}
          />
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Bordering Land Owners
        </Typography>
        {borderingLandOwners.map((owner, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label={`Bordering Land Owner ${index + 1}`}
              value={owner}
              onChange={(e) => handleBorderingOwnerChange(index, e.target.value)}
            />
            {borderingLandOwners.length > 1 && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveBorderingOwner(index)}
                sx={{ minWidth: 100 }}
              >
                Remove
              </Button>
            )}
          </Box>
        ))}
        <Button
          variant="outlined"
          onClick={handleAddBorderingOwner}
          sx={{ mt: 1 }}
        >
          Add Bordering Owner
        </Button>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Other Land Rights
        </Typography>
        {otherLandRights.map((right, index) => (
          <Box key={index} sx={{ border: 1, borderColor: 'divider', p: 2, mb: 2, borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Location"
                  value={right.location}
                  onChange={(e) => handleLandRightChange(index, 'location', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Size"
                  type="number"
                  value={right.size}
                  onChange={(e) => handleLandRightChange(index, 'size', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ha</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={right.developed}
                      onChange={(e) => handleLandRightChange(index, 'developed', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Developed"
                />
              </Grid>
            </Grid>
            {otherLandRights.length > 1 && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveLandRight(index)}
                sx={{ mt: 2 }}
                fullWidth
              >
                Remove Land Right
              </Button>
            )}
          </Box>
        ))}
        <Button
          variant="outlined"
          onClick={handleAddLandRight}
          sx={{ mt: 1 }}
        >
          Add Land Right
        </Button>
      </Grid>
    
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Supporting Documents
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUpload />}
              sx={{ height: 56, justifyContent: 'flex-start' }}
            >
              Upload ID Copy
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange('idCopy')}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </Button>
            <FilePreview 
              file={formik.values.idCopy} 
              onRemove={handleRemoveFile('idCopy')}
              error={formik.touched.idCopy && formik.errors.idCopy}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUpload />}
              sx={{ height: 56, justifyContent: 'flex-start' }}
            >
              Upload Proof of Residence
              <input
                type="file"
                hidden
                onChange={handleFileChange('proofOfResidence')}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </Button>
            <FilePreview 
              file={formik.values.proofOfResidence} 
              onRemove={handleRemoveFile('proofOfResidence')}
              error={formik.touched.proofOfResidence && formik.errors.proofOfResidence}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUpload />}
              sx={{ height: 56, justifyContent: 'flex-start' }}
            >
              Upload Site Plan
              <input
                type="file"
                hidden
                onChange={handleFileChange('sitePlan')}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </Button>
            <FilePreview 
              file={formik.values.sitePlan} 
              onRemove={handleRemoveFile('sitePlan')}
              error={formik.touched.sitePlan && formik.errors.sitePlan}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUpload />}
              sx={{ height: 56, justifyContent: 'flex-start' }}
            >
              Upload Other Documents
              <input
                type="file"
                hidden
                onChange={handleFileChange('otherDocuments')}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </Button>
            <FilePreview 
              file={formik.values.otherDocuments} 
              onRemove={handleRemoveFile('otherDocuments')}
              error={formik.touched.otherDocuments && formik.errors.otherDocuments}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const DeclarationStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Declaration
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" paragraph>
            I, {formik.values.fullName || '[Full Name]'} of ID No: {formik.values.nationalId || '[ID Number]'} 
            residing at {formik.values.postalAddress || '[Address]'} do hereby take an oath and declare the following:
          </Typography>
          
          <FormGroup sx={{ mb: 2 }}>
            <FormControlLabel
              control={<Checkbox />}
              label="I am over 18 years of age"
              checked={formik.values.age >= 18}
              disabled
            />
            <FormControlLabel
              control={<Checkbox />}
              label="I do not own any residential plot anywhere in Botswana"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="I have never owned a plot anywhere in Botswana"
            />
            {formik.values.maritalStatus === 'married' && (
              <>
                <FormControlLabel
                  control={<Checkbox />}
                  label="My spouse does not own a residential plot in Botswana"
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="My spouse has never owned a plot anywhere in Botswana"
                />
              </>
            )}
          </FormGroup>
          
          <Typography variant="body1" paragraph>
            I understand that:
          </Typography>
          
          <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
            <li>If the Land Board discovers that I applied while I was under the age of 18 years, I will not be enrolled in the waiting list.</li>
            <li>If I falsely apply for a deceased person, severe penalties will be imposed.</li>
            <li>If I forged another person&apos;s signature, serious punishment will be taken against me.</li>
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            I make the above declaration before Commissioner of Oaths consciously trusting and acknowledging that I understand 
            the contents of this declaration and that I consider it binding on my conscience.
          </Typography>
        </CardContent>
      </Card>
      
      <FormControlLabel
        control={
          <Checkbox
            checked={declarationAccepted}
            onChange={(e) => setDeclarationAccepted(e.target.checked)}
            name="declarationAccepted"
            color="primary"
          />
        }
        label="I declare that the information provided is complete and correct. I understand that the discovery of incorrect or false information shall result in the rejection of my application and/or prosecution and/or forfeiture of the plot if already granted to me."
      />
    </Box>
  );

  const ReviewStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Application
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography><strong>Full Name:</strong> {formik.values.fullName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>National ID:</strong> {formik.values.nationalId}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Date of Birth:</strong> {formik.values.dateOfBirth?.toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Age:</strong> {formik.values.age}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Gender:</strong> {formik.values.gender}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Citizenship:</strong> {formik.values.citizenship === 'citizen' ? 'Citizen' : 'Non-Citizen'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Marital Status:</strong> {formik.values.maritalStatus}</Typography>
            </Grid>
            {formik.values.maritalStatus === 'married' && (
              <Grid item xs={12} md={6}>
                <Typography><strong>Spouse Name:</strong> {formik.values.spouseName}</Typography>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <Typography><strong>Email:</strong> {formik.values.email}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Phone:</strong> {formik.values.phone}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography><strong>Postal Address:</strong> {formik.values.postalAddress}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Land Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography><strong>Plot Location:</strong> {formik.values.plotLocation}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Current Use:</strong> {formik.values.currentUse}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Land Size:</strong> {formik.values.landSize} {formik.values.landUnit}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Proposed Use:</strong> {formik.values.proposedUse === 'other' ? formik.values.otherUse : formik.values.proposedUse}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Site Debushed:</strong> {formik.values.debushed ? 'Yes' : 'No'}</Typography>
            </Grid>
          </Grid>
          
          {borderingLandOwners.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Bordering Land Owners:
              </Typography>
              <ul>
                {borderingLandOwners.map((owner, index) => (
                  <li key={index}>{owner}</li>
                ))}
              </ul>
            </Box>
          )}
          
          {otherLandRights.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Other Land Rights:
              </Typography>
              {otherLandRights.map((right, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Location:</strong> {right.location}, <strong>Size:</strong> {right.size} ha, 
                    <strong> Developed:</strong> {right.developed ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Supporting Documents
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography><strong>ID Copy:</strong> {formik.values.idCopy?.name || 'Not uploaded'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Proof of Residence:</strong> {formik.values.proofOfResidence?.name || 'Not uploaded'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Site Plan:</strong> {formik.values.sitePlan?.name || 'Not uploaded'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>Other Documents:</strong> {formik.values.otherDocuments?.name || 'Not uploaded'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        By submitting this application, you agree to the terms and conditions of the land allocation process.
      </Typography>
    </Box>
  );

  // Get current step content
  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return <PersonalInfoStep />;
      case 1:
        return <LandDetailsStep />;
      case 2:
        return <DeclarationStep />;
      case 3:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" component="main">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Application for Customary Land Rights
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            {getStepContent()}
          </CardContent>
        </Card>

        {activeStep === steps.length ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h5" gutterBottom>
              Application Submitted Successfully!
            </Typography>
            <Typography variant="body1">
              You will be redirected to your land records shortly...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Box>
              <Button variant="outlined" onClick={handleCancel} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button
                variant="outlined"
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
            </Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={formik.handleSubmit}
                disabled={loading || !declarationAccepted}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Application'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ApplyForLand;