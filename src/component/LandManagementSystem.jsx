import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChatbot } from '../context/ChatbotContext';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { FeatureGroup, GeoJSON, LayersControl, MapContainer, TileLayer } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import {
  calculateArea,
  findCentroid,
  validateAllocationForm
} from '../utils/geoUtils';
import { apiRequest, fetchPublicData } from './api';
import landService from '../services/landService';

const LandManagementSystem = () => {
  // State and context
  const { user, logout } = useAuth();
  const { addBotMessage } = useChatbot();
  const [parcels, setParcels] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [jurisdiction, setJurisdiction] = useState('national');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      addBotMessage("Loading land data...");
      try {
        const [parcelData, allocationData] = await Promise.all([
          fetchPublicData('/parcels'),
          apiRequest('GET', '/allocations')
        ]);
        setParcels(parcelData);
        setAllocations(allocationData);
        addBotMessage("Land data loaded successfully");
      } catch (err) {
        setError(err.message);
        addBotMessage(`Error loading data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addBotMessage]);

  // Handle parcel selection
  const handleParcelClick = useCallback((feature, layer) => {
    setSelectedParcel(feature.properties);
    addBotMessage(`Selected parcel ${feature.properties.parcelNumber}`);
    layer.bindPopup(`
      <div>
        <h3>Parcel ${feature.properties.parcelNumber}</h3>
        <p>Size: ${feature.properties.size} hectares</p>
        <p>Status: ${feature.properties.status}</p>
        <p>Jurisdiction: ${feature.properties.jurisdiction}</p>
      </div>
    `).openPopup();
  }, [addBotMessage]);

  // Handle new parcel creation
  const handleCreateParcel = useCallback(async (geometry) => {
    setLoading(true);
    addBotMessage("Creating new parcel...");
    try {
      const area = calculateArea(geometry.coordinates[0]);
      const centroid = findCentroid(geometry.coordinates[0]);

      const newParcel = {
        geometry,
        properties: {
          parcelNumber: `P-${Date.now()}`,
          size: area,
          centroid,
          status: 'draft',
          jurisdiction
        }
      };

      const createdParcel = await apiRequest('POST', '/parcels', newParcel);
      setParcels(prev => [...prev, createdParcel]);
      setSuccess('Parcel created successfully');
      addBotMessage(`Parcel ${createdParcel.properties.parcelNumber} created`);
    } catch (err) {
      setError(err.message);
      addBotMessage(`Error creating parcel: ${err.message}`);
    } finally {
      setLoading(false);
      setDrawingMode(null);
    }
  }, [jurisdiction, addBotMessage]);

  // Handle allocation request
  const handleAllocationRequest = useCallback(async (parcelId, formData) => {
    const validation = validateAllocationForm(formData);
    if (!validation.isValid) {
      setError(validation.errors[Object.keys(validation.errors)[0]]);
      return;
    }

    setLoading(true);
    addBotMessage("Submitting allocation request...");
    try {
      const allocation = await apiRequest('POST', '/allocations', {
        parcelId,
        ...formData,
        applicantId: user.id
      });
      setAllocations(prev => [...prev, allocation]);
      setSuccess('Allocation request submitted');
      addBotMessage(`Allocation request submitted for parcel ${parcelId}`);
    } catch (err) {
      setError(err.message);
      addBotMessage(`Error submitting allocation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user.id, addBotMessage]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4">Land Management System</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Box>
            <Select
              value={jurisdiction}
              onChange={(e) => {
                setJurisdiction(e.target.value);
                addBotMessage(`Changed jurisdiction to ${e.target.value}`);
              }}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              <MenuItem value="national">National</MenuItem>
              <MenuItem value="state">State</MenuItem>
              <MenuItem value="local">Local</MenuItem>
            </Select>
          </Box>
          {user && (
            <Box>
              <Typography>Welcome, {user.name} ({user.role})</Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Sidebar */}
        <Box sx={{ width: 300, p: 2, borderRight: '1px solid #ddd' }}>
          <Typography variant="h6" gutterBottom>Actions</Typography>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ mb: 2 }}
            onClick={() => setDrawingMode('parcel')}
            disabled={!user || user.role !== 'Admin'}
          >
            Create New Parcel
          </Button>
          
          {selectedParcel && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Selected Parcel: {selectedParcel.parcelNumber}
              </Typography>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mb: 2 }}
                onClick={() => setDrawingMode('allocation')}
                disabled={!user}
              >
                Request Allocation
              </Button>
            </Box>
          )}
        </Box>

        {/* Map Area */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <MapContainer 
            center={[-24.658, 25.908]} 
            zoom={10} 
            style={{ height: '100%', width: '100%' }}
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Base Map">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              </LayersControl.BaseLayer>

              <LayersControl.Overlay checked name="Parcels">
                <GeoJSON
                  data={parcels}
                  onEachFeature={handleParcelClick}
                  style={(feature) => ({
                    fillColor: feature.properties.jurisdiction === 'national' ? 'blue' : 
                              feature.properties.jurisdiction === 'state' ? 'purple' : 'orange',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.3
                  })}
                />
              </LayersControl.Overlay>

              <LayersControl.Overlay checked name="Allocations">
                <GeoJSON
                  data={allocations}
                  style={(feature) => ({
                    fillColor: feature.properties.status === 'approved' ? 'green' : 'orange',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.5
                  })}
                />
              </LayersControl.Overlay>

              {drawingMode === 'parcel' && (
                <FeatureGroup>
                  <EditControl
                    position="topright"
                    onCreated={(e) => {
                      const layer = e.layer;
                      const geoJSON = layer.toGeoJSON();
                      handleCreateParcel(geoJSON.geometry);
                    }}
                    draw={{
                      rectangle: false,
                      circle: false,
                      circlemarker: false,
                      marker: false,
                      polyline: false,
                      polygon: {
                        allowIntersection: false,
                        showArea: true,
                        metric: true
                      }
                    }}
                  />
                </FeatureGroup>
              )}
            </LayersControl>
          </MapContainer>

          {loading && (
            <Box sx={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000
            }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Box>

      {/* Allocation Request Dialog */}
      {drawingMode === 'allocation' && selectedParcel && (
        <AllocationFormDialog
          parcel={selectedParcel}
          onSubmit={handleAllocationRequest}
          onClose={() => setDrawingMode(null)}
        />
      )}

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

// Allocation Form Dialog Component
const AllocationFormDialog = ({ parcel, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    purpose: '',
    duration: 5,
    proposedUse: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const validation = validateAllocationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    onSubmit(parcel.id, formData);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request Allocation for {parcel.parcelNumber}</DialogTitle>
      <DialogContent>
        <TextField
          label="Purpose"
          fullWidth
          margin="normal"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          error={!!errors.purpose}
          helperText={errors.purpose}
          required
        />
        <TextField
          label="Duration (years)"
          type="number"
          fullWidth
          margin="normal"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
          error={!!errors.duration}
          helperText={errors.duration}
          required
        />
        <TextField
          label="Proposed Use"
          fullWidth
          margin="normal"
          value={formData.proposedUse}
          onChange={(e) => setFormData({ ...formData, proposedUse: e.target.value })}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LandManagementSystem;