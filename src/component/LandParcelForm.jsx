import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const LandParcelForm = ({
  initialValues = {},
  onSubmit,
  onCancel,
  isEdit = false,
  jurisdiction,
  landUseTypes = [],
}) => {
  // Form validation schema based on jurisdiction
  const validationSchema = Yup.object().shape({
    parcelId: Yup.string().required('Parcel ID is required'),
    locationName: Yup.string().required('Location name is required'),
    size: Yup.number()
      .required('Size is required')
      .positive('Size must be positive')
      .min(0.01, 'Minimum size is 0.01 hectares'),
    landUse: Yup.string()
      .required('Land use is required')
      .oneOf(landUseTypes, 'Invalid land use for this jurisdiction'),
    tenureType: Yup.string().required('Tenure type is required'),
    status: Yup.string().required('Status is required'),
    coordinates: Yup.array()
      .of(Yup.array().of(Yup.number()))
      .min(1, 'At least one coordinate pair is required'),
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      parcelId: '',
      locationName: '',
      size: '',
      landUse: '',
      tenureType: '',
      status: 'available',
      coordinates: [],
      jurisdiction: jurisdiction,
      ...initialValues
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Handle coordinate input (simplified for form - in real app would use map)
  const [coordinateInput, setCoordinateInput] = useState('');
  const [coordinateError, setCoordinateError] = useState('');

  const handleAddCoordinate = () => {
    try {
      const coords = coordinateInput.split(',').map(Number);
      if (coords.length !== 2 || coords.some(isNaN)) {
        throw new Error('Invalid coordinate format');
      }
      
      formik.setFieldValue(
        'coordinates',
        [...formik.values.coordinates, coords]
      );
      setCoordinateInput('');
      setCoordinateError('');
    } catch (err) {
      setCoordinateError('Please enter coordinates as "lat,lng"');
    }
  };

  const removeCoordinate = (index) => {
    const newCoords = [...formik.values.coordinates];
    newCoords.splice(index, 1);
    formik.setFieldValue('coordinates', newCoords);
  };

  // Update jurisdiction when prop changes
  useEffect(() => {
    formik.setFieldValue('jurisdiction', jurisdiction);
  }, [jurisdiction]);

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Land Parcel' : 'Create New Land Parcel'}
        <Typography variant="subtitle1" color="textSecondary">
          Jurisdiction: {jurisdiction}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="parcelId"
                name="parcelId"
                label="Parcel ID"
                value={formik.values.parcelId}
                onChange={formik.handleChange}
                error={formik.touched.parcelId && Boolean(formik.errors.parcelId)}
                helperText={formik.touched.parcelId && formik.errors.parcelId}
                disabled={isEdit}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="locationName"
                name="locationName"
                label="Location Name"
                value={formik.values.locationName}
                onChange={formik.handleChange}
                error={formik.touched.locationName && Boolean(formik.errors.locationName)}
                helperText={formik.touched.locationName && formik.errors.locationName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="size"
                name="size"
                label={`Size (hectares)`}
                type="number"
                value={formik.values.size}
                onChange={formik.handleChange}
                error={formik.touched.size && Boolean(formik.errors.size)}
                helperText={formik.touched.size && formik.errors.size}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="landUse-label">Land Use</InputLabel>
                <Select
                  labelId="landUse-label"
                  id="landUse"
                  name="landUse"
                  value={formik.values.landUse}
                  onChange={formik.handleChange}
                  error={formik.touched.landUse && Boolean(formik.errors.landUse)}
                  label="Land Use"
                >
                  {landUseTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.landUse && formik.errors.landUse && (
                  <Typography color="error" variant="caption">
                    {formik.errors.landUse}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="tenureType-label">Tenure Type</InputLabel>
                <Select
                  labelId="tenureType-label"
                  id="tenureType"
                  name="tenureType"
                  value={formik.values.tenureType}
                  onChange={formik.handleChange}
                  error={formik.touched.tenureType && Boolean(formik.errors.tenureType)}
                  label="Tenure Type"
                >
                  <MenuItem value="freehold">Freehold</MenuItem>
                  <MenuItem value="leasehold">Leasehold</MenuItem>
                  <MenuItem value="customary">Customary</MenuItem>
                  <MenuItem value="state">State Land</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  label="Status"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="allocated">Allocated</MenuItem>
                  <MenuItem value="reserved">Reserved</MenuItem>
                  <MenuItem value="disputed">Disputed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Parcel Coordinates
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  value={coordinateInput}
                  onChange={(e) => setCoordinateInput(e.target.value)}
                  placeholder="Enter lat,lng"
                  error={Boolean(coordinateError)}
                  helperText={coordinateError}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddCoordinate}
                >
                  Add
                </Button>
              </Box>

              {formik.values.coordinates.length > 0 ? (
                <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', p: 1 }}>
                  {formik.values.coordinates.map((coord, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>
                        {coord[0]}, {coord[1]}
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeCoordinate(index)}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="warning">No coordinates added</Alert>
              )}
              {formik.touched.coordinates && formik.errors.coordinates && (
                <Typography color="error" variant="caption">
                  {formik.errors.coordinates}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={!formik.isValid || !formik.dirty}
        >
          {isEdit ? 'Update Parcel' : 'Create Parcel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LandParcelForm;