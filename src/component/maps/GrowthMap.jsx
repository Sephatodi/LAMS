import { Box, Typography } from '@mui/material';
import { loadModules } from 'esri-loader';
import { useEffect, useRef } from 'react';

const GrowthMap = ({ model, timeHorizon, growthRate }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    let componentMounted = true;
    let mapView;

    loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/renderers/SimpleRenderer',
      'esri/symbols/SimpleFillSymbol'
    ]).then(([Map, MapView, FeatureLayer, SimpleRenderer, SimpleFillSymbol]) => {
      if (!componentMounted) return;

      const map = new Map({
        basemap: 'gray-vector'
      });

      mapView = new MapView({
        container: mapRef.current,
        map: map,
        center: [model.centerLongitude, model.centerLatitude],
        zoom: model.initialZoom
      });

      // Add growth prediction layer
      const growthLayer = new FeatureLayer({
        url: model.serviceUrl,
        renderer: new SimpleRenderer({
          symbol: new SimpleFillSymbol({
            color: [255, 0, 0, 0.5],
            outline: {
              color: [255, 255, 255],
              width: 1
            }
          }),
          visualVariables: [{
            type: 'color',
            field: 'growth_score',
            stops: [
              { value: 0, color: [255, 255, 255, 0] },
              { value: 100, color: [255, 0, 0, 0.8] }
            ]
          }]
        }),
        popupTemplate: {
          title: "Growth Prediction",
          content: [{
            type: "fields",
            fieldInfos: [
              { fieldName: "growth_score", label: "Growth Potential" },
              { fieldName: "time_horizon", label: "Time Horizon (years)" },
              { fieldName: "growth_rate", label: "Annual Growth Rate (%)" }
            ]
          }]
        }
      });

      map.add(growthLayer);

      // Update layer definition expression based on props
      growthLayer.definitionExpression = `time_horizon = ${timeHorizon} AND growth_rate >= ${growthRate}`;
    });

    return () => {
      componentMounted = false;
      if (mapView) {
        mapView.destroy();
      }
    };
  }, [model, timeHorizon, growthRate]);

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: 'white', p: 1 }}>
        Model: {model.name} | Horizon: {timeHorizon} years | Rate: {growthRate}%
      </Typography>
    </Box>
  );
};

export default GrowthMap;