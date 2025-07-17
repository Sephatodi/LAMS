import PropTypes from 'prop-types';
import { GeoJSON } from 'react-leaflet';

const WaterResourceLayer = ({ 
  data, 
  onFeatureClick, 
  editable = false,
  onEditComplete 
}) => {
  const defaultStyle = {
    color: '#3498db',
    weight: 2,
    opacity: 1,
    fillColor: '#a5d8ff',
    fillOpacity: 0.7
  };

  const highlightStyle = {
    color: '#2980b9',
    weight: 3,
    fillColor: '#5dade2'
  };

  const onEachFeature = (feature, layer) => {
    if (onFeatureClick) {
      layer.on({
        click: (e) => {
          onFeatureClick(feature, e);
          layer.setStyle(highlightStyle);
          setTimeout(() => layer.setStyle(defaultStyle), 1000);
        }
      });
    }

    const popupContent = `
      <div class="water-resource-popup">
        <h4>${feature.properties?.name || 'Water Resource'}</h4>
        <p><strong>Type:</strong> ${feature.properties?.type || 'N/A'}</p>
        <p><strong>Status:</strong> ${feature.properties?.status || 'N/A'}</p>
        <p><strong>Capacity:</strong> ${feature.properties?.capacity ? `${feature.properties.capacity} m³` : 'N/A'}</p>
        ${feature.properties?.lastInspection ? 
          `<p><strong>Last Inspected:</strong> ${new Date(feature.properties.lastInspection).toLocaleDateString()}</p>` : ''
        }
      </div>
    `;

    layer.bindPopup(popupContent);
  };

  if (!data) return null;

  return (
    <GeoJSON 
      data={data}
      style={defaultStyle}
      onEachFeature={onEachFeature}
    />
  );
};

WaterResourceLayer.propTypes = {
  data: PropTypes.object,
  onFeatureClick: PropTypes.func,
  editable: PropTypes.bool,
  onEditComplete: PropTypes.func
};

WaterResourceLayer.displayName = 'WaterResourceLayer';

export default WaterResourceLayer;