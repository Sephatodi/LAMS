 
import {
    Clear as ClearIcon,
    GpsFixed as GpsIcon,
    Help as HelpIcon,
    Straighten as MeasureIcon,
    ShapeLine as PolygonIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    Tooltip,
    Typography,
    styled
} from '@mui/material';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import {
    FeatureGroup,
    MapContainer,
    TileLayer,
    WMSTileLayer
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import useAudit from '../../hooks/useAudit';

// Botswana-specific configuration
const BOTSWANA_CONFIG = {
    DEFAULT_CENTER: [-24.658, 25.908], // Gaborone coordinates
    DEFAULT_ZOOM: 13,
    MIN_PARCEL_SIZE: 300, // m² (Botswana minimum standard)
    MAX_PARCEL_SIZE: 50000, // m² (Botswana maximum for urban plots)
    MIN_VERTICES: 4,
    MAX_VERTICES: 20,
    MAX_ASPECT_RATIO: 5, // Max width/height ratio
    LAND_USE_TYPES: [
        'residential',
        'commercial',
        'agricultural',
        'industrial',
        'conservation',
        'community'
    ],
    GOVERNMENT_WMS_URL: 'https://gis.gov.bw/geoserver/wms',
    REFERENCE_LAYERS: {
        cadastral: 'botswana:parcels',
        zoning: 'botswana:zoning',
        tribal: 'botswana:tribal_lands'
    }
};

const StyledMapContainer = styled(MapContainer)({
    height: '100%',
    width: '100%',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
});

const PolygonDrawingMap = ({ onSave, initialData, onPolygonComplete }) => {
    const { currentUser } = useAuth();
    const { logAction } = useAudit();
    const [drawnItems, setDrawnItems] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [activeTool, setActiveTool] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [drawingMode, _setDrawingMode] = useState('standard');
    const [showReferenceLayers, setShowReferenceLayers] = useState(true);
    const [landUseType, setLandUseType] = useState('residential');
    const [validationErrors, setValidationErrors] = useState([]);
    const featureGroupRef = useRef();
    const mapRef = useRef();
    const api = useApi();
    const { enqueueSnackbar } = useSnackbar();

    // Initialize with any provided data
    useEffect(() => {
        if (initialData) {
            setDrawnItems(initialData.features || []);
            setMeasurements(initialData.features?.map(f => f.properties.measurement) || []);
        }
    }, [initialData]);

    const checkForConflicts = async (geometry) => {
        try {
            const response = await api.post('/gis/check-conflicts', { geometry });
            if (response.data.conflicts.length > 0) {
                setValidationErrors(response.data.conflicts);
                return false;
            }
            return true;
        } catch (err) {
            enqueueSnackbar(err.message  || 'Failed to validate parcel', { variant: 'error' });
            return false;
        }
    };

    const handleCreated = async (e) => {
        const { layerType, layer } = e;
        
        try {
            // Validate against Botswana regulations
            if (layerType === 'polygon') {
                const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
                
                if (area < BOTSWANA_CONFIG.MIN_PARCEL_SIZE) {
                    throw new Error(`Parcel too small (minimum ${BOTSWANA_CONFIG.MIN_PARCEL_SIZE}m²)`);
                }
                
                if (area > BOTSWANA_CONFIG.MAX_PARCEL_SIZE) {
                    throw new Error(`Parcel too large (maximum ${BOTSWANA_CONFIG.MAX_PARCEL_SIZE}m²)`);
                }
                
                const vertices = layer.getLatLngs()[0].length;
                if (vertices < BOTSWANA_CONFIG.MIN_VERTICES || 
                    vertices > BOTSWANA_CONFIG.MAX_VERTICES) {
                    throw new Error(`Parcel must have between ${BOTSWANA_CONFIG.MIN_VERTICES}-${BOTSWANA_CONFIG.MAX_VERTICES} vertices`);
                }
                
                // Check for reasonable shape (not too elongated)
                const bounds = layer.getBounds();
                const width = bounds.getEast() - bounds.getWest();
                const height = bounds.getNorth() - bounds.getSouth();
                const ratio = Math.max(width, height) / Math.min(width, height);
                
                if (ratio > BOTSWANA_CONFIG.MAX_ASPECT_RATIO) {
                    throw new Error('Parcel shape is too elongated (width:height ratio > 5:1)');
                }

                // Call the onPolygonComplete callback if provided
                if (onPolygonComplete) {
                    const coordinates = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
                    onPolygonComplete(coordinates);
                }
            }

            // Check for conflicts with existing parcels
            const geoJSON = layer.toGeoJSON();
            const hasConflicts = await checkForConflicts(geoJSON.geometry);
            
            if (!hasConflicts) {
                layer.remove();
                enqueueSnackbar('Parcel has conflicts with existing allocations', { variant: 'error' });
                return;
            }

            const newItem = { 
                layerType, 
                layer,
                timestamp: new Date().toISOString(),
                createdBy: currentUser.id,
                landUseType
            };
            
            if (layerType === 'polygon') {
                const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
                newItem.measurement = {
                    type: 'area',
                    value: area,
                    unit: 'm²',
                    label: `${area.toFixed(2)} m²`
                };
            } else if (layerType === 'polyline') {
                const length = layer._layer._latlngs.reduce((total, latlng, index, array) => {
                    if (index === 0) return total;
                    return total + latlng.distanceTo(array[index - 1]);
                }, 0);
                newItem.measurement = {
                    type: 'length',
                    value: length,
                    unit: 'm',
                    label: `${length.toFixed(2)} m`
                };
            }

            setDrawnItems([...drawnItems, newItem]);
            if (newItem.measurement) {
                setMeasurements([...measurements, newItem.measurement]);
            }
            
            logAction('drawing_created', {
                type: layerType,
                size: newItem.measurement?.value || 0,
                landUseType,
                mode: drawingMode
            });
            
            setError(null);
            setValidationErrors([]);
            setSuccess('Parcel successfully created');
            setTimeout(() => setSuccess(null), 3000);
            
        } catch (err) {
            setError(err.message);
            layer.remove();
            logAction('drawing_error', {
                error: err.message,
                type: layerType,
                landUseType
            });
        }
    };

    const clearAll = () => {
        if (featureGroupRef.current) {
            featureGroupRef.current.clearLayers();
        }
        setDrawnItems([]);
        setMeasurements([]);
        setError(null);
        setValidationErrors([]);
        logAction('drawing_cleared');
    };

    const saveDrawing = () => {
        if (drawnItems.length === 0) {
            setError('No parcels to save');
            return;
        }
        
        try {
            const features = drawnItems.map(item => ({
                type: 'Feature',
                geometry: item.layer.toGeoJSON().geometry,
                properties: {
                    measurement: item.measurement,
                    createdBy: item.createdBy,
                    timestamp: item.timestamp,
                    landUseType: item.landUseType,
                    status: 'draft',
                    // Botswana-specific metadata
                    district: currentUser.district || 'Unknown',
                    landBoard: currentUser.landBoard || 'Unknown',
                    drawingMode
                }
            }));

            const featureCollection = {
                type: 'FeatureCollection',
                features,
                metadata: {
                    created: new Date().toISOString(),
                    createdBy: currentUser.id,
                    system: 'Botswana Land Management System',
                    version: '1.0',
                    coordinateSystem: 'EPSG:4326',
                    standards: 'Botswana Land Policy 2015'
                }
            };

            if (onSave) {
                onSave(featureCollection);
            }
            
            logAction('drawing_saved', {
                featureCount: features.length,
                totalArea: features.reduce((sum, f) => sum + (f.properties.measurement?.value || 0), 0),
                landUseType
            });
            
            setSuccess('Parcels saved successfully');
            setTimeout(() => setSuccess(null), 3000);
            
        } catch (err) {
            setError('Failed to save drawing: ' + err.message);
            logAction('save_error', {
                error: err.message
            });
        }
    };

    const centerOnBotswana = () => {
        if (mapRef.current) {
            mapRef.current.flyTo(BOTSWANA_CONFIG.DEFAULT_CENTER, BOTSWANA_CONFIG.DEFAULT_ZOOM);
        }
    };

    const toggleReferenceLayers = () => {
        setShowReferenceLayers(!showReferenceLayers);
        logAction('reference_layers_toggled', { visible: !showReferenceLayers });
    };

    return (
        <Box sx={{ position: 'relative', height: '100%' }}>
            <StyledMapContainer
                center={BOTSWANA_CONFIG.DEFAULT_CENTER}
                zoom={BOTSWANA_CONFIG.DEFAULT_ZOOM}
                whenCreated={map => { mapRef.current = map; }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Botswana Government Reference Layers */}
                {showReferenceLayers && (
                    <>
                        <WMSTileLayer
                            url={BOTSWANA_CONFIG.GOVERNMENT_WMS_URL}
                            layers={BOTSWANA_CONFIG.REFERENCE_LAYERS.cadastral}
                            format="image/png"
                            transparent={true}
                            version="1.1.0"
                            attribution="Botswana Government Cadastre"
                        />
                        <WMSTileLayer
                            url={BOTSWANA_CONFIG.GOVERNMENT_WMS_URL}
                            layers={BOTSWANA_CONFIG.REFERENCE_LAYERS.zoning}
                            format="image/png"
                            transparent={true}
                            version="1.1.0"
                            attribution="Botswana Zoning"
                        />
                    </>
                )}
                
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topright"
                        onCreated={handleCreated}
                        draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: activeTool === 'measure',
                            polygon: activeTool === 'draw'
                        }}
                    />
                </FeatureGroup>
            </StyledMapContainer>

            {/* Enhanced Drawing Tools Panel */}
            <Paper sx={{ 
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
                p: 2,
                width: 320,
                borderRadius: 2,
                boxShadow: 3
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Botswana Parcel Delineation
                    </Typography>
                    <Tooltip title="Help">
                        <IconButton>
                            <HelpIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {validationErrors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Parcel Conflicts:</Typography>
                        <ul>
                            {validationErrors.map((err, i) => (
                                <li key={i}>{err.type}: {err.message}</li>
                            ))}
                        </ul>
                    </Alert>
                )}
                
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Land Use Type</InputLabel>
                    <Select
                        value={landUseType}
                        onChange={(e) => setLandUseType(e.target.value)}
                        label="Land Use Type"
                    >
                        {BOTSWANA_CONFIG.LAND_USE_TYPES.map(type => (
                            <MenuItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                        variant={activeTool === 'draw' ? 'contained' : 'outlined'}
                        onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')}
                        startIcon={<PolygonIcon />}
                        fullWidth
                    >
                        Draw
                    </Button>
                    <Button
                        variant={activeTool === 'measure' ? 'contained' : 'outlined'}
                        onClick={() => setActiveTool(activeTool === 'measure' ? null : 'measure')}
                        startIcon={<MeasureIcon />}
                        fullWidth
                    >
                        Measure
                    </Button>
                    <Tooltip title="Center on Botswana">
                        <IconButton onClick={centerOnBotswana}>
                            <GpsIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                
                <FormControlLabel
                    control={
                        <Switch 
                            checked={showReferenceLayers}
                            onChange={toggleReferenceLayers}
                        />
                    }
                    label="Show Reference Layers"
                    sx={{ mb: 2 }}
                />
                
                <Divider sx={{ my: 1 }} />
                
                {measurements.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Measurements:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {measurements.map((m, i) => (
                                <Chip key={i} label={m.label} size="small" />
                            ))}
                        </Box>
                    </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={clearAll}
                        startIcon={<ClearIcon />}
                        color="error"
                        fullWidth
                    >
                        Clear All
                    </Button>
                    <Button
                        variant="contained"
                        onClick={saveDrawing}
                        startIcon={<SaveIcon />}
                        disabled={drawnItems.length === 0}
                        fullWidth
                    >
                        Submit to Land Board
                    </Button>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Botswana Land Board Requirements:
                    </Typography>
                    <Typography variant="caption" display="block">
                        • Min size: {BOTSWANA_CONFIG.MIN_PARCEL_SIZE}m²
                    </Typography>
                    <Typography variant="caption" display="block">
                        • Max size: {BOTSWANA_CONFIG.MAX_PARCEL_SIZE}m²
                    </Typography>
                    <Typography variant="caption" display="block">
                        • {BOTSWANA_CONFIG.MIN_VERTICES}-{BOTSWANA_CONFIG.MAX_VERTICES} vertices
                    </Typography>
                    <Typography variant="caption" display="block">
                        • Max aspect ratio: {BOTSWANA_CONFIG.MAX_ASPECT_RATIO}:1
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default PolygonDrawingMap;