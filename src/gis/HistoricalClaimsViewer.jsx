// /src/gis/HistoricalClaimsViewer.jsx
import { CalendarToday, Layers, Timeline } from '@mui/icons-material';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Typography
} from '@mui/material';
import { loadModules } from 'esri-loader';
import { useEffect, useRef, useState } from 'react';

const HistoricalClaimsViewer = ({ mapView, layerId }) => {
  const [timeRange, setTimeRange] = useState([1900, new Date().getFullYear()]);
  const [claimTypes, setClaimTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const layerRef = useRef(null);

  useEffect(() => {
    let componentMounted = true;

    loadModules([
      'esri/layers/FeatureLayer',
      'esri/renderers/SimpleRenderer',
      'esri/symbols/SimpleFillSymbol',
      'esri/widgets/TimeSlider'
    ]).then(([FeatureLayer, SimpleRenderer, SimpleFillSymbol, TimeSlider]) => {
      if (!componentMounted) return;

      // Historical claims layer
      const layer = new FeatureLayer({
        id: layerId,
        url: "https://services.arcgis.com/your-historical-service/arcgis/rest/services/HistoricalClaims/FeatureServer",
        outFields: ["*"],
        renderer: new SimpleRenderer({
          symbol: new SimpleFillSymbol({
            color: [255, 0, 0, 0.5],
            outline: {
              color: [200, 0, 0],
              width: 1
            }
          })
        }),
        popupTemplate: {
          title: "Historical Land Claim",
          content: [{
            type: "fields",
            fieldInfos: [
              { fieldName: "CLAIM_TYPE", label: "Claim Type" },
              { fieldName: "CLAIM_YEAR", label: "Year Claimed" },
              { fieldName: "CLAIMANT", label: "Original Claimant" },
              { fieldName: "EVIDENCE", label: "Documentary Evidence" },
              { fieldName: "RESOLUTION", label: "Resolution Status" }
            ]
          }]
        },
        timeInfo: {
          startField: "START_DATE",
          endField: "END_DATE"
        }
      });

      mapView.map.add(layer);
      layerRef.current = layer;

      // Initialize time slider
      const timeSlider = new TimeSlider({
        container: "timeSliderContainer",
        view: mapView,
        mode: "time-window",
        playRate: 1000,
        stops: {
          interval: {
            value: 10,
            unit: "years"
          }
        }
      });

      // Query for unique claim types
      layer.queryFeatures({
        where: "1=1",
        outFields: ["CLAIM_TYPE"],
        returnDistinctValues: true
      }).then(({ features }) => {
        if (componentMounted) {
          const types = features.map(f => f.attributes.CLAIM_TYPE);
          setClaimTypes(types);
          setSelectedTypes(types); // Select all by default
        }
      });

      // Set initial time extent
      layer.queryExtent().then(({ extent }) => {
        if (extent) {
          const years = extent.timeExtent.end.getFullYear() - extent.timeExtent.start.getFullYear();
          setTimeRange([
            extent.timeExtent.start.getFullYear(),
            extent.timeExtent.end.getFullYear()
          ]);
        }
      });
    });

    return () => {
      componentMounted = false;
      if (mapView && layerRef.current) {
        mapView.map.remove(layerRef.current);
      }
    };
  }, [mapView, layerId]);

  // Apply filters when they change
  useEffect(() => {
    if (!layerRef.current) return;

    let whereClause = "1=1";
    
    // Claim type filter
    if (selectedTypes.length > 0 && selectedTypes.length < claimTypes.length) {
      whereClause += ` AND CLAIM_TYPE IN (${selectedTypes.map(t => `'${t}'`).join(',')})`;
    }

    // Time range filter
    whereClause += ` AND CLAIM_YEAR >= ${timeRange[0]} AND CLAIM_YEAR <= ${timeRange[1]}`;

    layerRef.current.definitionExpression = whereClause;
  }, [selectedTypes, timeRange, claimTypes]);

  return (
    <Paper sx={{ p: 2, position: 'absolute', bottom: 20, left: 20, zIndex: 1, width: 350 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Timeline sx={{ mr: 1 }} /> Historical Claims Viewer
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          <CalendarToday fontSize="small" sx={{ mr: 1 }} /> 
          Time Range: {timeRange[0]} - {timeRange[1]}
        </Typography>
        <Slider
          value={timeRange}
          onChange={(e, newValue) => setTimeRange(newValue)}
          min={1900}
          max={new Date().getFullYear()}
          valueLabelDisplay="auto"
        />
      </Box>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel><Layers fontSize="small" sx={{ mr: 1 }} /> Claim Types</InputLabel>
        <Select
          multiple
          value={selectedTypes}
          onChange={(e) => setSelectedTypes(e.target.value)}
          renderValue={(selected) => `${selected.length} selected`}
        >
          {claimTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <div id="timeSliderContainer" style={{ height: '60px' }} />
    </Paper>
  );
};

export default HistoricalClaimsViewer;
