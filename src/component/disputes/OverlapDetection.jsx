// /src/components/disputes/OverlapDetection.jsx
import {
  Gavel as DisputeIcon,
  Map as MapIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import { loadModules } from 'esri-loader';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveDispute } from '../../store/disputesSlice';

const OverlapDetection = ({ mapView, parcelLayerId }) => {
  const [overlaps, setOverlaps] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const dispatch = useDispatch();
  const activeDispute = useSelector(state => state.disputes.activeDispute);

  const detectOverlaps = async () => {
    setIsAnalyzing(true);
    
    loadModules([
      'esri/geometry/geometryEngine',
      'esri/tasks/Geoprocessor',
      'esri/tasks/support/FeatureSet'
    ]).then(async ([geometryEngine, Geoprocessor, FeatureSet]) => {
      try {
        // Get all parcels from the layer
        const parcelLayer = mapView.map.findLayerById(parcelLayerId);
        const parcelFeatures = await parcelLayer.queryFeatures();
        
        // Convert to geometries for analysis
        const parcels = parcelFeatures.features.map(f => f.geometry);
        
        // Find overlaps
        const overlapResults = [];
        
        for (let i = 0; i < parcels.length; i++) {
          for (let j = i + 1; j < parcels.length; j++) {
            const intersection = geometryEngine.intersect(parcels[i], parcels[j]);
            if (intersection && !geometryEngine.isEmpty(intersection)) {
              const area = geometryEngine.geodesicArea(intersection, 'square-meters');
              if (area > 1) { // Minimum overlap area threshold
                overlapResults.push({
                  parcel1: parcelFeatures.features[i].attributes.PARCEL_ID,
                  parcel2: parcelFeatures.features[j].attributes.PARCEL_ID,
                  area: area.toFixed(2),
                  geometry: intersection
                });
              }
            }
          }
        }
        
        setOverlaps(overlapResults);
      } catch (error) {
        console.error('Overlap detection failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    });
  };

  const highlightOverlap = (overlap) => {
    dispatch(setActiveDispute({
      type: 'boundary_overlap',
      parcels: [overlap.parcel1, overlap.parcel2],
      area: overlap.area,
      geometry: overlap.geometry
    }));
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <WarningIcon color="warning" sx={{ mr: 1 }} /> Boundary Overlap Detection
      </Typography>
      
      <Button
        variant="contained"
        onClick={detectOverlaps}
        disabled={isAnalyzing}
        sx={{ mb: 2 }}
      >
        {isAnalyzing ? 'Analyzing...' : 'Run Boundary Analysis'}
      </Button>
      
      {overlaps.length > 0 ? (
        <>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Detected {overlaps.length} boundary overlaps:
          </Typography>
          
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {overlaps.map((overlap, index) => (
              <React.Fragment key={index}>
                <ListItem 
                  button
                  selected={activeDispute?.parcels?.includes(overlap.parcel1)}
                  onClick={() => highlightOverlap(overlap)}
                >
                  <ListItemIcon>
                    <DisputeIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Parcel ${overlap.parcel1} ↔ Parcel ${overlap.parcel2}`}
                    secondary={`Overlap area: ${overlap.area} m²`}
                  />
                  <Chip 
                    label="Boundary" 
                    size="small" 
                    color="error" 
                    variant="outlined"
                  />
                </ListItem>
                {index < overlaps.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 200,
          textAlign: 'center',
          color: 'text.secondary'
        }}>
          <MapIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography>No boundary overlaps detected yet</Typography>
          <Typography variant="caption">Click "Run Boundary Analysis" to scan for overlaps</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default OverlapDetection;