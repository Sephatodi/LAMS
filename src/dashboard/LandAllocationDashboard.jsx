/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
  Alert,
  Box, Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Typography
} from '@mui/material';
import axios from 'axios';
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from 'react';
import { GeoJSON, LayersControl, MapContainer, TileLayer } from 'react-leaflet';

const LandAllocationDashboard = () => {
  // System state
  const [landParcels, setLandParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [applications, setApplications] = useState([]);
  const [allocationPlan, setAllocationPlan] = useState(null);
  const [waterDesign, setWaterDesign] = useState(null);
  const [sewageDesign, setSewageDesign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [adminApproval, setAdminApproval] = useState(false);

  // Fetch all available land parcels
  useEffect(() => {
    const fetchLandParcels = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/land-parcels');
        setLandParcels(response.data);
      } catch (err) {
        setError(err.message  ||'Failed to fetch land parcels');
      } 
      finally {
        setLoading(false);
      }
    };
    
    fetchLandParcels();
  }, []);

  // Fetch pending applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('/api/applications/pending');
        setApplications(response.data);
      } 
      catch (err) {
       setError(err.message || 'Failed to fetch land parcels');
      }
    };
    
    fetchApplications();
  }, []);

  // Process selected land parcel
  const processLandParcel = async (parcelId) => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Get parcel details
      const parcelResponse = await axios.get(`/api/land-parcels/${parcelId}`);
      setSelectedParcel(parcelResponse.data);
      
      // 2. Generate housing plan
      const planResponse = await axios.post('/api/generate-plan', {
        parcelId,
        applicationCount: applications.length
      });
      setAllocationPlan(planResponse.data);
      
      // 3. Generate infrastructure designs
      const waterResponse = await axios.post('/api/design-water', {
        parcelId,
        plotCount: planResponse.data.plots.length
      });
      setWaterDesign(waterResponse.data);
      
      const sewageResponse = await axios.post('/api/design-sewage', {
        parcelId,
        plotCount: planResponse.data.plots.length
      });
      setSewageDesign(sewageResponse.data);
      
      setSuccess('Land parcel processed successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  // Allocate plots to applicants
  const allocatePlots = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/allocate-plots', {
        parcelId: selectedParcel.id,
        planId: allocationPlan.id,
        applicationIds: applications.map(app => app.id)
      });
      
      setSuccess(response.data.message);
      setAdminApproval(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Allocation failed');
    } finally {
      setLoading(false);
    }
  };

  // Admin approval
  const approveAllocation = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/approve-allocation', {
        parcelId: selectedParcel.id,
        planId: allocationPlan.id
      });
      
      setSuccess(response.data.message);
      setAdminApproval(false);
      // Refresh data
      setSelectedParcel(null);
      setAllocationPlan(null);
      setApplications([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  // Render parcel boundaries on map
  const renderParcelBoundaries = () => {
    if (!selectedParcel) return null;
    
    return (
      <GeoJSON
        data={selectedParcel.geoJson}
        style={() => ({
          color: '#3388ff',
          weight: 3,
          fillOpacity: 0.2
        })}
      />
    );
  };

  // Render plot allocations
  const renderPlots = () => {
    if (!allocationPlan) return null;
    
    return allocationPlan.plots.map(plot => (
      <GeoJSON
        key={plot.id}
        data={plot.geoJson}
        style={() => ({
          color: plot.allocated ? '#4CAF50' : '#FF5722',
          weight: 2,
          fillOpacity: 0.5
        })}
      />
    ));
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Botswana Land Allocation System
      </Typography>
      
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      
      <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
        {/* Left sidebar - Land parcels list */}
        <Box sx={{ width: '30%' }}>
          <Typography variant="h6" gutterBottom>
            Available Land Parcels
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Parcel ID</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Size (ha)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {landParcels.map(parcel => (
                  <TableRow key={parcel.id}>
                    <TableCell>{parcel.id}</TableCell>
                    <TableCell>{parcel.district}, {parcel.village}</TableCell>
                    <TableCell>{parcel.size}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => processLandParcel(parcel.id)}
                        disabled={loading}
                      >
                        Process
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Pending Applications ({applications.length})
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Requested Size</TableCell>
                  <TableCell>Purpose</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map(app => (
                  <TableRow key={app.id}>
                    <TableCell>{app.id}</TableCell>
                    <TableCell>{app.applicantName}</TableCell>
                    <TableCell>{app.requestedSize} ha</TableCell>
                    <TableCell>{app.purpose}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        {/* Main content - Map and details */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ height: '500px', mb: 3 }}>
            <MapContainer 
              center={[-22, 24]} 
              zoom={6} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <LayersControl position="topright">
                <LayersControl.Overlay name="Parcel Boundaries" checked>
                  {renderParcelBoundaries()}
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Plots" checked>
                  {renderPlots()}
                </LayersControl.Overlay>
              </LayersControl>
            </MapContainer>
          </Box>
          
          {selectedParcel && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">
                Selected Parcel: {selectedParcel.id} - {selectedParcel.district}
              </Typography>
              <Typography>
                Size: {selectedParcel.size} hectares | Zoning: {selectedParcel.zoning}
              </Typography>
            </Box>
          )}
          
          {allocationPlan && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">
                Allocation Plan: {allocationPlan.plots.length} plots
              </Typography>
              <Typography>
                Residential: {allocationPlan.residentialPlots} | 
                Commercial: {allocationPlan.commercialPlots} | 
                Public: {allocationPlan.publicPlots}
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={allocatePlots}
                disabled={loading || applications.length === 0}
                sx={{ mt: 2 }}
              >
                Allocate Plots
              </Button>
            </Box>
          )}
          
          {waterDesign && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">
                Water Delivery Design
              </Typography>
              <Typography>
                Type: {waterDesign.type} | 
                Capacity: {waterDesign.capacity} m³/day | 
                Infrastructure Cost: BWP {waterDesign.estimatedCost.toLocaleString()}
              </Typography>
            </Box>
          )}
          
          {sewageDesign && (
            <Box>
              <Typography variant="h6">
                Sewage System Design
              </Typography>
              <Typography>
                Type: {sewageDesign.type} | 
                Capacity: {sewageDesign.capacity} households | 
                Infrastructure Cost: BWP {sewageDesign.estimatedCost.toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Admin approval dialog */}
      <Dialog open={adminApproval} onClose={() => setAdminApproval(false)}>
        <DialogTitle>Approve Allocation Plan</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please review the allocation plan before approval:
          </Typography>
          
          {allocationPlan && (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Parcel:</strong> {selectedParcel.id}</Typography>
              <Typography><strong>Total Plots:</strong> {allocationPlan.plots.length}</Typography>
              <Typography><strong>Applicants:</strong> {applications.length}</Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Infrastructure Details:
              </Typography>
              <Typography><strong>Water System:</strong> {waterDesign?.type}</Typography>
              <Typography><strong>Sewage System:</strong> {sewageDesign?.type}</Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Estimated Costs:
              </Typography>
              <Typography>
                <strong>Total:</strong> BWP {
                  (waterDesign?.estimatedCost + sewageDesign?.estimatedCost).toLocaleString()
                }
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminApproval(false)}>Cancel</Button>
          <Button 
            onClick={approveAllocation}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Approve Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LandAllocationDashboard;