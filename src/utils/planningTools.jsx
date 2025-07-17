/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    Home,
    Layers,
    LegendToggle,
    Park,
    Terrain,
    Timeline
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Typography
} from '@mui/material';
import * as turf from '@turf/turf';
import L from 'leaflet';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMap } from 'react-leaflet';
import { useLayerManager } from '../hooks/useLayerManager';
import LayerErrorBoundary from '../Layers/LayerErrorBoundary';

// Constants
const DENSITY_OPTIONS = [
  { value: 'low', label: 'Low (1 unit/acre)', factor: 0.7 },
  { value: 'medium', label: 'Medium (2 units/acre)', factor: 0.5 },
  { value: 'high', label: 'High (4+ units/acre)', factor: 0.3 }
];

const DEFAULT_CONSTRAINTS = {
  population: 1000,
  density: 'medium',
  preserveGreenSpace: true,
  minInfrastructureDistance: 500,
  maxSlope: 15,
  minSoilQuality: 0.5
};

const PlanningTool = React.memo(({ 
  parcels = [], 
  infrastructure = [], 
  onAllocationSubmit,
  onPlanPreview
}) => {
  const map = useMap();
  const { addLayer, removeLayer } = useLayerManager();
  const [constraints, setConstraints] = useState(DEFAULT_CONSTRAINTS);
  const [allocationPlan, setAllocationPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  // Memoized suitability analysis
  const analyzedParcels = useMemo(() => {
    return parcels.map(parcel => ({
      ...parcel,
      suitability: landSuitabilityAnalysis(parcel, infrastructure),
      distanceToInfrastructure: calculateInfrastructureDistance(parcel, infrastructure)
    }));
  }, [parcels, infrastructure]);

  // Generate color-coded visualization layer
  const visualizationLayer = useMemo(() => {
    return new L.GeoJSON(analyzedParcels, {
      style: feature => ({
        fillColor: getColor(feature.properties.suitability),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div class="parcel-popup">
            <h3>Parcel ${feature.properties.id}</h3>
            <p>Suitability: ${feature.properties.suitability.toFixed(1)}%</p>
            <p>Soil Quality: ${(feature.properties.soil_quality * 100).toFixed(1)}%</p>
            <p>Slope: ${feature.properties.slope.toFixed(1)}°</p>
            <p>Distance to Infrastructure: ${feature.properties.distanceToInfrastructure.toFixed(0)}m</p>
          </div>
        `);
      }
    });
  }, [analyzedParcels]);

  // Update map layers when data changes
  useEffect(() => {
    addLayer('suitability-layer', visualizationLayer);
    return () => removeLayer('suitability-layer');
  }, [visualizationLayer, addLayer, removeLayer]);

  // Generate allocation plan
  const generatePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const plan = await calculateOptimalAllocation(analyzedParcels, constraints);
      setAllocationPlan(plan);
      if (onPlanPreview) onPlanPreview(plan);
    } catch (err) {
      setError(err.message);
      console.error('Planning error:', err);
    } finally {
      setLoading(false);
    }
  }, [analyzedParcels, constraints, onPlanPreview]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (allocationPlan) {
      onAllocationSubmit(allocationPlan);
    }
  }, [allocationPlan, onAllocationSubmit]);

  // Handle constraint changes
  const handleConstraintChange = (name, value) => {
    setConstraints(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <LayerErrorBoundary>
      <Box sx={{ 
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 1,
        boxShadow: 3,
        maxWidth: 350
      }}>
        <Typography variant="h6" gutterBottom>
          <Home sx={{ mr: 1, verticalAlign: 'middle' }} />
          Housing Development Planner
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            <Terrain sx={{ mr: 1, verticalAlign: 'middle' }} />
            Planning Constraints
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Target Population</InputLabel>
            <Slider
              value={constraints.population}
              onChange={(e, val) => handleConstraintChange('population', val)}
              min={100}
              max={10000}
              step={100}
              valueLabelDisplay="auto"
              marks={[
                { value: 1000, label: '1K' },
                { value: 5000, label: '5K' },
                { value: 10000, label: '10K' }
              ]}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Development Density</InputLabel>
            <Select
              value={constraints.density}
              onChange={(e) => handleConstraintChange('density', e.target.value)}
              label="Development Density"
            >
              {DENSITY_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={constraints.preserveGreenSpace}
                  onChange={(e) => handleConstraintChange('preserveGreenSpace', e.target.checked)}
                />
                <Typography>Preserve Green Spaces</Typography>
                <Park sx={{ ml: 1 }} />
              </Box>
            </FormControl>

            <FormControl>
              <InputLabel>Max Slope (°)</InputLabel>
              <Slider
                value={constraints.maxSlope}
                onChange={(e, val) => handleConstraintChange('maxSlope', val)}
                min={0}
                max={45}
                step={1}
                valueLabelDisplay="auto"
              />
            </FormControl>

            <FormControl>
              <InputLabel>Min Soil Quality</InputLabel>
              <Slider
                value={constraints.minSoilQuality}
                onChange={(e, val) => handleConstraintChange('minSoilQuality', val)}
                min={0}
                max={1}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            onClick={generatePlan}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Timeline />}
            fullWidth
          >
            {loading ? 'Generating...' : 'Generate Plan'}
          </Button>

          {allocationPlan && (
            <Button
              variant="outlined"
              onClick={handleSubmit}
              startIcon={<Layers />}
              fullWidth
            >
              Submit Plan
            </Button>
          )}
        </Box>

        {allocationPlan && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              Plan Summary:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${allocationPlan.parcels.length} parcels`} 
                size="small" 
              />
              <Chip 
                label={`${allocationPlan.totalUnits} units`} 
                size="small" 
                color="primary"
              />
              <Chip 
                label={`${allocationPlan.meetsTarget ? 'Target met' : 'Target not met'}`} 
                size="small" 
                color={allocationPlan.meetsTarget ? 'success' : 'warning'}
              />
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button
            size="small"
            startIcon={<LegendToggle />}
            onClick={() => setShowLegend(!showLegend)}
          >
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </Button>
        </Box>

        {showLegend && (
          <Box sx={{ 
            mt: 2,
            p: 1,
            bgcolor: 'background.default',
            borderRadius: 1
          }}>
            <Typography variant="caption" display="block" gutterBottom>
              Suitability Score
            </Typography>
            <Box sx={{ 
              height: 10,
              background: 'linear-gradient(to right, #ff0000 0%, #80ff00 100%)',
              borderRadius: 5,
              mb: 1
            }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">0%</Typography>
              <Typography variant="caption">100%</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </LayerErrorBoundary>
  );
});

PlanningTool.propTypes = {
  parcels: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    geometry: PropTypes.object.isRequired,
    properties: PropTypes.shape({
      soil_quality: PropTypes.number,
      slope: PropTypes.number,
      area: PropTypes.number,
      isGreenSpace: PropTypes.bool
    }).isRequired
  })).isRequired,
  infrastructure: PropTypes.arrayOf(PropTypes.object),
  onAllocationSubmit: PropTypes.func.isRequired,
  onPlanPreview: PropTypes.func
};

export default PlanningTool;

// Enhanced land suitability analysis with infrastructure consideration
export const landSuitabilityAnalysis = (parcel, infrastructure = []) => {
  const { properties } = parcel;
  
  // Normalize factors with safe defaults
  const soilQuality = Math.min(Math.max(properties.soil_quality || 0.5, 0), 1);
  const slope = Math.min(properties.slope || 30, 90);
  const distance = calculateInfrastructureDistance(parcel, infrastructure);
  
  // Weighted scoring (adjust weights as needed)
  const score = 
    soilQuality * 40 + 
    (1 - slope/90) * 30 +
    (1 - Math.min(distance, 2000)/2000 * 30);// Normalize distance (0-2km)
  
  return Math.min(100, Math.max(0, score));
};

// Calculate distance to nearest infrastructure point
const calculateInfrastructureDistance = (parcel, infrastructure) => {
  if (!infrastructure.length) return 0;
  
  const parcelCenter = turf.centerOfMass(parcel.geometry);
  let minDistance = Infinity;
  
  infrastructure.forEach(item => {
    const distance = turf.distance(parcelCenter, item.geometry);
    if (distance < minDistance) minDistance = distance;
  });
  
  return minDistance * 1000; // Convert to meters
};

// Enhanced allocation algorithm with multi-criteria optimization
export const calculateOptimalAllocation = async (parcels, constraints) => {
  // Filter suitable parcels
  const suitableParcels = parcels.filter(parcel => {
    return (
      (!constraints.preserveGreenSpace || !parcel.properties.isGreenSpace) &&
      parcel.properties.slope <= constraints.maxSlope &&
      parcel.properties.soil_quality >= constraints.minSoilQuality &&
      parcel.distanceToInfrastructure <= constraints.minInfrastructureDistance
    );
  });

  if (suitableParcels.length === 0) {
    throw new Error('No suitable parcels found with current constraints');
  }

  // Calculate housing units needed
  const densityFactor = DENSITY_OPTIONS.find(d => d.value === constraints.density)?.factor || 0.5;
  const targetUnits = Math.ceil(constraints.population * densityFactor);

  // Sort parcels by combined suitability and infrastructure proximity
  const sortedParcels = [...suitableParcels].sort((a, b) => {
    const scoreA = a.suitability * 0.7 + (1 - a.distanceToInfrastructure/2000) * 0.3;
    const scoreB = b.suitability * 0.7 + (1 - b.distanceToInfrastructure/2000) * 0.3;
    return scoreB - scoreA;
  });

  // Allocate parcels using knapsack-like algorithm
  const allocatedParcels = [];
  let remainingUnits = targetUnits;
  let totalArea = 0;

  for (const parcel of sortedParcels) {
    if (remainingUnits <= 0) break;

    const parcelArea = parcel.properties.area || 1; // in acres
    const parcelCapacity = Math.min(
      Math.floor(parcelArea / densityFactor),
      remainingUnits
    );

    if (parcelCapacity > 0) {
      allocatedParcels.push({
        ...parcel,
        allocatedUnits: parcelCapacity,
        developmentDensity: constraints.density
      });
      remainingUnits -= parcelCapacity;
      totalArea += parcelArea;
    }
  }

  return {
    parcels: allocatedParcels,
    totalUnits: targetUnits - remainingUnits,
    totalArea,
    meetsTarget: remainingUnits <= 0,
    constraints,
    suitabilityScore: allocatedParcels.reduce((sum, p) => sum + p.suitability, 0) / allocatedParcels.length
  };
};

// Utility function for color gradient
const getColor = (score) => {
  const hue = score * 1.2; // 0 (red) to 120 (green)
  return `hsl(${hue}, 100%, 45%)`;
};