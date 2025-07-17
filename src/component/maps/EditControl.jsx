/* eslint-disable no-unused-vars */
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const EditControl = ({ 
  onCreated, 
  onEdited, 
  onDeleted,
  drawOptions = {
    polygon: true,
    polyline: true,
    rectangle: true,
    circle: true,
    marker: true,
    circlemarker: false
  },
  editOptions = {}
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Initialize feature group
    const featureGroup = L.featureGroup();
    map.addLayer(featureGroup);

    // Initialize draw control
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        ...drawOptions,
        polygon: {
          ...drawOptions.polygon,
          shapeOptions: {
            color: '#3388ff',
            weight: 4,
            opacity: 0.7,
            fillOpacity: 0.3
          }
        },
        rectangle: {
          ...drawOptions.rectangle,
          shapeOptions: {
            color: '#3388ff',
            weight: 4,
            opacity: 0.7,
            fillOpacity: 0.3
          }
        }
      },
      edit: {
        ...editOptions,
        featureGroup: featureGroup,
        remove: true
      }
    });

    map.addControl(drawControl);

    // Event handlers
    const handleCreated = (e) => {
      const layer = e.layer;
      featureGroup.addLayer(layer);
      onCreated?.(layer);
    };

    const handleEdited = (e) => {
      const layers = e.layers;
      layers.eachLayer(_layer => {
        // Update any properties if needed
      });
      onEdited?.(e.layers);
    };

    const handleDeleted = (e) => {
      onDeleted?.(e.layers);
    };

    // Add event listeners
    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    // Cleanup
    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
      map.removeLayer(featureGroup);
    };
  }, [map, onCreated, onEdited, onDeleted, drawOptions, editOptions]);

  return null;
};

export default EditControl;