import { Alert, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { GeoJSON, LayersControl, MapContainer, TileLayer } from 'react-leaflet';
import useApi from '../../hooks/useApi';
import Legend from '../Legend';
import ConflictDetailsPanel from './ConflictDetailsPanel';

const StyledMapContainer = styled(MapContainer)(({ theme }) => ({
  height: '100%',
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const ConflictDetectionMap = ({ allocationData, onConflictResolved }) => {
  const [conflicts, setConflicts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [resolutionInProgress, setResolutionInProgress] = useState(false);
  const api = useApi();
  const { enqueueSnackbar } = useSnackbar();

  const fetchConflicts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (allocationData?.conflicts) {
        // Transform allocation conflicts to GeoJSON format
        const conflictGeoJson = {
          type: 'FeatureCollection',
          features: allocationData.conflicts.map(conflict => ({
            type: 'Feature',
            properties: {
              id: conflict.id,
              type: 'Land Allocation Conflict',
              status: 'Active',
              severity: conflict.severity || 'high',
              parcels: [conflict.plot.number],
              parties: [conflict.applicant.name],
              dateReported: conflict.dateReported,
              description: conflict.reason || 'Double allocation detected'
            },
            geometry: {
              type: 'Point',
              coordinates: conflict.coordinates || [25.908, -24.658] // Default Botswana coords
            }
          }))
        };
        setConflicts(conflictGeoJson);
      } else {
        const response = await api.get('/api/conflicts');
        setConflicts(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load conflict data');
      enqueueSnackbar('Error loading conflicts', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [allocationData, api, enqueueSnackbar]);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  const handleResolveConflict = useCallback(async (conflictId) => {
    try {
      setResolutionInProgress(true);
      await api.post(`/conflicts/${conflictId}/resolve`);
      
      setConflicts(prev => ({
        ...prev,
        features: prev.features.filter(f => f.properties.id !== conflictId)
      }));
      
      enqueueSnackbar('Conflict resolved successfully', { variant: 'success' });
      onConflictResolved?.(conflictId);
    } catch (err) {
      enqueueSnackbar(err.message ||'Failed to resolve conflict', { variant: 'error' });
    } finally {
      setResolutionInProgress(false);
    }
  }, [api, enqueueSnackbar, onConflictResolved]);

  const getSeverityColor = (severity) => {
    const colors = {
      high: '#e74c3c',
      medium: '#f39c12',
      low: '#f1c40f',
      resolved: '#2ecc71'
    };
    return colors[severity?.toLowerCase()] || '#95a5a6';
  };

  const conflictStyle = (feature) => ({
    fillColor: getSeverityColor(feature.properties.severity),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  });

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => setSelectedConflict(feature.properties)
    });

    const popupContent = `
      <div class="conflict-popup">
        <h4>Conflict #${feature.properties.id}</h4>
        <p><strong>Type:</strong> ${feature.properties.type}</p>
        <p><strong>Status:</strong> ${feature.properties.status}</p>
        <p><strong>Severity:</strong> ${feature.properties.severity}</p>
        <button onclick="window.dispatchEvent(new CustomEvent('resolveConflict', { detail: '${feature.properties.id}' }))">
          Mark Resolved
        </button>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  useEffect(() => {
    const handleResolve = (e) => handleResolveConflict(e.detail);
    window.addEventListener('resolveConflict', handleResolve);
    return () => window.removeEventListener('resolveConflict', handleResolve);
  }, [handleResolveConflict]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress size={60} />
    </Box>
  );

  if (error) return (
    <Alert severity="error" sx={{ m: 2 }}>
      {error}
    </Alert>
  );

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {resolutionInProgress && (
        <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
          <Alert severity="info">Resolving conflict...</Alert>
        </Box>
      )}

      <StyledMapContainer
        center={[-24.658, 25.908]} // Botswana coordinates
        zoom={6}
        zoomControl={false}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {conflicts && (
          <GeoJSON
            data={conflicts}
            style={conflictStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </StyledMapContainer>

      <Legend title="Conflict Severity">
        {['high', 'medium', 'low', 'resolved'].map(severity => (
          <Legend.Item 
            key={severity} 
            color={getSeverityColor(severity)} 
            label={severity}
          />
        ))}
      </Legend>

      {selectedConflict && (
        <ConflictDetailsPanel
          conflict={selectedConflict}
          onClose={() => setSelectedConflict(null)}
          onResolve={() => {
            handleResolveConflict(selectedConflict.id);
            setSelectedConflict(null);
          }}
        />
      )}
    </Box>
  );
};

export default ConflictDetectionMap;