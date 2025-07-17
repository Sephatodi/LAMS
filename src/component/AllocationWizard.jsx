/** @jsxRuntime classic */
/** @jsx React.createElement */


// src/components/AllocationWizard.jsx
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography
} from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const steps = ['Select Plot', 'Applicant Details', 'Review & Confirm'];

const AllocationWizard = ({ open, onClose, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [plotLocation, setPlotLocation] = useState(null);
  const [applicantData, setApplicantData] = useState({
    name: '',
    idNumber: '',
    contact: '',
    email: '',
    address: ''
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onComplete({
        ...applicantData,
        plotLocation,
        allocationDate: new Date().toISOString(),
        status: 'pending'
      });
      onClose();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicantData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>New Land Allocation Wizard</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ height: 400 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select the plot to allocate
            </Typography>
            <MapContainer 
              center={[-24.658, 25.908]} 
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <PlotSelectionLayer onSelect={setPlotLocation} />
            </MapContainer>
            {plotLocation && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Selected plot coordinates: {JSON.stringify(plotLocation.coordinates)}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Applicant Full Name"
              name="name"
              variant="outlined"
              fullWidth
              value={applicantData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="National ID Number"
              name="idNumber"
              variant="outlined"
              fullWidth
              value={applicantData.idNumber}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Contact Number"
              name="contact"
              variant="outlined"
              fullWidth
              value={applicantData.contact}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Email Address"
              name="email"
              variant="outlined"
              fullWidth
              value={applicantData.email}
              onChange={handleInputChange}
            />
            <TextField
              label="Physical Address"
              name="address"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={applicantData.address}
              onChange={handleInputChange}
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Plot Details</Typography>
            <Box component="pre" sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              overflowX: 'auto'
            }}>
              {JSON.stringify(plotLocation, null, 2)}
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Applicant Details</Typography>
            <Box component="pre" sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              overflowX: 'auto'
            }}>
              {JSON.stringify(applicantData, null, 2)}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={handleBack} disabled={activeStep === 0}>
            Back
          </Button>
          <Button 
            variant="contained" 
            onClick={handleNext}
            color="primary"
            sx={{ ml: 1 }}
            disabled={activeStep === 0 && !plotLocation}
          >
            {activeStep === steps.length - 1 ? 'Complete Allocation' : 'Next'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const PlotSelectionLayer = ({ onSelect }) => {
  const map = useMap();

  // Sample available plots data
  const availablePlots = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: "plot-1",
          name: "Block 7 Industrial",
          area: 10000,
          status: "available",
          zoning: "industrial"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-24.65, 25.91],
            [-24.65, 25.92],
            [-24.66, 25.92],
            [-24.66, 25.91],
            [-24.65, 25.91]
          ]]
        }
      }
    ]
  };

  return (
    <GeoJSON
      data={availablePlots}
      style={(feature) => ({
        color: feature.properties.status === 'available' ? 'green' : 'red',
        weight: 2,
        fillOpacity: 0.2
      })}
      onEachFeature={(feature, layer) => {
        layer.bindPopup(`
          <b>${feature.properties.name}</b><br>
          Status: ${feature.properties.status}<br>
          Area: ${feature.properties.area} m²<br>
          Zoning: ${feature.properties.zoning}
        `);
        
        layer.on({
          click: (_e) => {
            if (feature.properties.status === 'available') {
              onSelect({
                id: feature.properties.id,
                name: feature.properties.name,
                coordinates: feature.geometry.coordinates[0],
                area: feature.properties.area,
                zoning: feature.properties.zoning
              });
              map.flyToBounds(layer.getBounds());
            }
          }
        });
      }}
    />
  );
};

export default AllocationWizard;