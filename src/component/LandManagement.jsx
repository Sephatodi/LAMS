import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useChatbot } from '../context/ChatbotContext';
import { useLandLaws } from '../hooks';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import LandParcelForm from './LandParcelForm';
import landService from '../services/landService';
import { setLandData } from '../services/landSlice';

const LandManagement = () => {
  // State management
  const [jurisdiction, setJurisdiction] = useState('national');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  
  // Context and hooks
  const { addBotMessage } = useChatbot();
  const { laws, loading: lawsLoading, error: lawsError, updateLaw, validateLandUse } = useLandLaws(jurisdiction);
  const { user } = useSelector((state) => state.auth);
  const { parcels } = useSelector((state) => state.land);
  const dispatch = useDispatch();

  // Fetch land data
  useEffect(() => {
    const fetchLandData = async () => {
      try {
        const parcelData = await landService.getLandParcels(user.token);
        dispatch(setLandData(parcelData));
        setLoading(false);
        addBotMessage('Land parcels loaded successfully');
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        toast.error(errorMsg);
        addBotMessage(`Error loading parcels: ${errorMsg}`);
        setLoading(false);
      }
    };

    fetchLandData();
  }, [dispatch, user.token, addBotMessage]);

  // Handle parcel creation
  const handleCreateParcel = async (formData) => {
    try {
      // Validate land use according to jurisdiction laws
      if (!validateLandUse(formData.landUse)) {
        throw new Error(`Land use type ${formData.landUse} not permitted in ${jurisdiction}`);
      }

      const response = await landService.createLandParcel(formData, user.token);
      dispatch(setLandData([...parcels, response]));
      toast.success('Land parcel created successfully');
      addBotMessage(`New land parcel created: ${response.parcelId}`);
      setShowForm(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
      addBotMessage(`Error creating parcel: ${errorMsg}`);
    }
  };

  // Handle parcel update
  const handleUpdateParcel = async (id, formData) => {
    try {
      const response = await landService.updateLandParcel(id, formData, user.token);
      const updatedParcels = parcels.map(parcel =>
        parcel._id === id ? response : parcel
      );
      dispatch(setLandData(updatedParcels));
      toast.success('Land parcel updated successfully');
      addBotMessage(`Parcel ${id} updated`);
      setSelectedParcel(null);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
      addBotMessage(`Error updating parcel: ${errorMsg}`);
    }
  };

  // Handle law update
  const handleLawUpdate = async (lawId, newText) => {
    try {
      await updateLaw(lawId, newText);
      addBotMessage(`Law ${lawId} updated successfully!`);
      toast.success('Law updated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
      addBotMessage(`Failed to update law: ${errorMsg}`);
    }
  };

  if (loading || lawsLoading) {
    addBotMessage("Loading land data...");
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (lawsError) {
    return <Alert severity="error">Error loading laws: {lawsError.message}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Land Management</Typography>
        {user.role === 'Admin' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowForm(true)}
          >
            Add New Parcel
          </Button>
        )}
      </Box>

      {/* Jurisdiction Selector */}
      <Box mb={3}>
        <Typography variant="h6">Jurisdiction</Typography>
        <Select
          value={jurisdiction}
          onChange={(e) => {
            setJurisdiction(e.target.value);
            addBotMessage(`Changed jurisdiction to ${e.target.value}`);
          }}
          fullWidth
        >
          <MenuItem value="national">National</MenuItem>
          <MenuItem value="state">State</MenuItem>
          <MenuItem value="local">Local</MenuItem>
        </Select>
      </Box>

      {/* Land Parcel Form */}
      {showForm && (
        <LandParcelForm
          onSubmit={handleCreateParcel}
          onCancel={() => setShowForm(false)}
          jurisdiction={jurisdiction}
          landUseTypes={laws.landUseTypes || []}
        />
      )}

      {selectedParcel && (
        <LandParcelForm
          initialValues={selectedParcel}
          onSubmit={(data) => handleUpdateParcel(selectedParcel._id, data)}
          onCancel={() => setSelectedParcel(null)}
          isEdit
          jurisdiction={jurisdiction}
          landUseTypes={laws.landUseTypes || []}
        />
      )}

      {/* Parcels Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Parcel ID</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Size (ha)</TableCell>
              <TableCell>Land Use</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parcels.map((parcel) => (
              <TableRow key={parcel._id}>
                <TableCell>{parcel.parcelId}</TableCell>
                <TableCell>{parcel.locationName}</TableCell>
                <TableCell>{parcel.size}</TableCell>
                <TableCell>{parcel.landUse}</TableCell>
                <TableCell>{parcel.status}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => setSelectedParcel(parcel)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Laws Section */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          {jurisdiction.toUpperCase()} Land Laws
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          {laws.map(law => (
            <Box component="li" key={law.id} sx={{ mb: 2 }}>
              <Typography variant="h6">{law.title}</Typography>
              <Typography paragraph>{law.description}</Typography>
              {user.role === 'Admin' && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    const newText = prompt('Enter new law text', law.description);
                    if (newText) await handleLawUpdate(law.id, newText);
                  }}
                >
                  Update Law
                </Button>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default LandManagement;