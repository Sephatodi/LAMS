import { Box, Typography } from '@mui/material';
import { loadModules } from 'esri-loader';
import { useEffect, useRef } from 'react';

const RiskMap = ({ risks, onSelectRisk }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    let componentMounted = true;
    let mapView;

    loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/renderers/SimpleRenderer',
      'esri/symbols/SimpleFillSymbol',
      'esri/Graphic'
    ]).then(([Map, MapView, FeatureLayer, SimpleRenderer, SimpleFillSymbol, Graphic]) => {
      if (!componentMounted) return;

      const map = new Map({
        basemap: 'topo-vector'
      });

      mapView = new MapView({
        container: mapRef.current,
        map: map,
        center: [24.0, -22.0], // Botswana approximate center
        zoom: 6
      });

      // Add risk points
      risks.forEach(risk => {
        const pointGraphic = new Graphic({
          geometry: {
            type: 'point',
            longitude: risk.longitude,
            latitude: risk.latitude
          },
          symbol: {
            type: 'simple-marker',
            color: risk.severity > 75 ? [255, 0, 0] : 
                  risk.severity > 50 ? [255, 165, 0] : [255, 255, 0],
            size: '12px',
            outline: {
              color: [255, 255, 255],
              width: 1
            }
          },
          attributes: risk,
          popupTemplate: {
            title: risk.areaName,
            content: [{
              type: "fields",
              fieldInfos: [
                { fieldName: "type", label: "Risk Type" },
                { fieldName: "severity", label: "Severity (%)" },
                { fieldName: "atRiskPopulation", label: "Population at Risk" },
                { fieldName: "hazardType", label: "Hazard Type" }
              ]
            }]
          }
        });

        mapView.graphics.add(pointGraphic);
      });

      // Set up click handler
      mapView.on('click', (event) => {
        mapView.hitTest(event).then((response) => {
          if (response.results.length > 0) {
            const graphic = response.results[0].graphic;
            if (graphic && graphic.attributes) {
              onSelectRisk(graphic.attributes);
            }
          }
        });
      });
    });

    return () => {
      componentMounted = false;
      if (mapView) {
        mapView.destroy();
      }
    };
  }, [risks, onSelectRisk]);

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      <Box sx={{ 
        position: 'absolute', 
        top: 8, 
        right: 8, 
        backgroundColor: 'white', 
        p: 1,
        display: 'flex',
        gap: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            backgroundColor: '#ff0000', 
            mr: 1,
            border: '1px solid white'
          }} />
          <Typography variant="caption">High Risk</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            backgroundColor: '#ffa500', 
            mr: 1,
            border: '1px solid white'
          }} />
          <Typography variant="caption">Medium Risk</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            backgroundColor: '#ffff00', 
            mr: 1,
            border: '1px solid white'
          }} />
          <Typography variant="caption">Low Risk</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RiskMap;