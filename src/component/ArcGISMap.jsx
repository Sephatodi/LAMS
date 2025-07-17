import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useArcGIS } from '../hooks/useArcGIS';
import ImmutableLogger from '../security/audit/ImmutableLogger';

import Basemap from '@arcgis/core/Basemap';
import config from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';

import './ArcGISMap.css';
import { useLandParcelLayer, useZoningLayer } from './LandParcelLayer';

// Enhanced basemap configuration
const BASEMAPS = {
  local: 'streets-navigation-vector',
  regional: 'topo-vector',
  national: 'hybrid',
  global: 'satellite',
  satellite: 'satellite',
  terrain: 'terrain'
};

// Default configuration
const DEFAULT_CENTER = [24.0, -22.0];
const DEFAULT_ZOOM = 6;
const GEOFENCE_CHECK_INTERVAL = 5000;

// Tenure type color mapping
const TENURE_COLORS = {
  allocated: [56, 168, 0, 0.7],       // Green
  available: [255, 211, 0, 0.7],     // Yellow
  reserved: [255, 128, 0, 0.7],      // Orange
  protected: [255, 0, 0, 0.7],       // Red
  customary: [0, 112, 255, 0.7],     // Blue
  disputed: [168, 0, 132, 0.7]       // Purple
};

const ArcGISMap = ({
  layers = [],
  onMapLoad,
  onDrawComplete,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  enableGeofenceAlerts = true,
  enableDrawing = true,
  locale = 'en',
  allocationData = [],
  tenureData = []
}) => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);
  const widgetRefs = useRef({
    print: null,
    measurement: null,
    editor: null,
    sketch: null
  });
  const positionWatcher = useRef(null);
  
  const [mapError, setMapError] = useState(null);
  const [isOffline] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [ setAlerts] = useState([]);
  const [ setActiveGeofences] = useState([]);
  const [tenureLayer, setTenureLayer] = useState(null);
  const [allocationLayer, setAllocationLayer] = useState(null);
  
  const { user } = useAuth();
  const { modules, loading } = useArcGIS([
    'esri/Map',
    'esri/views/MapView',
    'esri/layers/GraphicsLayer',
    'esri/geometry/projection',
    'esri/layers/FeatureLayer'
  ]);

  // Initialize ArcGIS configuration
  useEffect(() => {
    try {
      config.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;
      config.assetsPath = './assets';
      config.workers.loaderConfig = {
        paths: {
          '@arcgis/core': `https://js.arcgis.com/4.28/@arcgis/core`
        }
      };
    } catch (err) {
      console.error('ArcGIS config error:', err);
      setMapError('Failed to configure ArcGIS');
    }
  }, []);

  const landParcelLayer = useLandParcelLayer();
  const zoningLayer = useZoningLayer();

  const operationalLayers = useMemo(() => {
    const baseLayers = [...layers];
    if (!layers.some(l => l.id === 'landParcels')) baseLayers.push(landParcelLayer);
    if (!layers.some(l => l.id === 'zoning')) baseLayers.push(zoningLayer);
    return baseLayers;
  }, [landParcelLayer, layers, zoningLayer]);

  // Create tenure visualization layer
  const createTenureLayer = useCallback(() => {
    if (!tenureData.length || !modules) return null;

    return new FeatureLayer({
      id: 'tenure-layer',
      title: 'Land Tenure',
      fields: [
        { name: 'id', type: 'oid' },
        { name: 'tenureType', type: 'string' },
        { name: 'community', type: 'string' },
        { name: 'startDate', type: 'date' },
        { name: 'endDate', type: 'date' }
      ],
      objectIdField: 'id',
      geometryType: 'polygon',
      spatialReference: { wkid: 4326 },
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [255, 255, 255, 0.2],
          outline: {
            width: 1,
            color: [50, 50, 50, 0.6]
          }
        },
        visualVariables: [{
          type: 'color',
          field: 'tenureType',
          stops: Object.entries(TENURE_COLORS).map(([type, color]) => ({
            value: type,
            color: color
          }))
        }]
      },
      popupTemplate: {
        title: 'Tenure Information',
        content: [{
          type: 'fields',
          fieldInfos: [
            { fieldName: 'tenureType', label: 'Tenure Type' },
            { fieldName: 'community', label: 'Community' },
            { fieldName: 'startDate', label: 'Start Date', format: { dateFormat: 'short-date' } },
            { fieldName: 'endDate', label: 'End Date', format: { dateFormat: 'short-date' } }
          ]
        }]
      },
      source: tenureData.map(item => ({
        geometry: item.geometry,
        attributes: {
          id: item.id,
          tenureType: item.type,
          community: item.community,
          startDate: item.startDate,
          endDate: item.endDate
        }
      }))
    });
  }, [tenureData, modules]);

  // Create allocation visualization layer
  const createAllocationLayer = useCallback(() => {
    if (!allocationData.length || !modules) return null;

    return new FeatureLayer({
      id: 'allocation-layer',
      title: 'Allocated Plots',
      fields: [
        { name: 'id', type: 'oid' },
        { name: 'applicant', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'score', type: 'integer' },
        { name: 'date', type: 'date' }
      ],
      objectIdField: 'id',
      geometryType: 'polygon',
      spatialReference: { wkid: 4326 },
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [56, 168, 0, 0.5],
          outline: {
            width: 2,
            color: [255, 255, 255, 0.8]
          }
        },
        visualVariables: [{
          type: 'color',
          field: 'score',
          stops: [
            { value: 0, color: [255, 0, 0, 0.5] },    // Red for low score
            { value: 50, color: [255, 211, 0, 0.5] }, // Yellow for medium
            { value: 100, color: [56, 168, 0, 0.5] }  // Green for high
          ]
        }]
      },
      popupTemplate: {
        title: 'Allocation Information',
        content: [{
          type: 'fields',
          fieldInfos: [
            { fieldName: 'applicant', label: 'Applicant' },
            { fieldName: 'status', label: 'Status' },
            { fieldName: 'score', label: 'Score' },
            { fieldName: 'date', label: 'Allocation Date', format: { dateFormat: 'short-date' } }
          ]
        }]
      },
      source: allocationData.map(item => ({
        geometry: item.geometry,
        attributes: {
          id: item.id,
          applicant: item.applicant,
          status: item.status,
          score: item.score,
          date: item.date
        }
      }))
    });
  }, [allocationData, modules]);

  // Update layers when data changes
  useEffect(() => {
    if (!isInitialized || !viewRef.current) return;

    const view = viewRef.current;
    const map = view.map;

    // Remove existing layers
    if (tenureLayer) map.remove(tenureLayer);
    if (allocationLayer) map.remove(allocationLayer);

    // Add new layers
    const newTenureLayer = createTenureLayer();
    const newAllocationLayer = createAllocationLayer();

    if (newTenureLayer) {
      map.add(newTenureLayer);
      setTenureLayer(newTenureLayer);
    }

    if (newAllocationLayer) {
      map.add(newAllocationLayer);
      setAllocationLayer(newAllocationLayer);
    }
  }, [tenureData, allocationData, isInitialized, tenureLayer, allocationLayer, createTenureLayer, createAllocationLayer]);

  const initProjection = useCallback(async () => {
    if (!modules?.[3]) return false;
    
    try {
      const projection = modules[3];
      if (!projection.isLoaded()) {
        await projection.load();
      }
      return true;
    } catch (err) {
      console.error('Projection error:', err);
      throw err;
    }
  }, [modules]);

  const setupDrawing = useCallback((view) => {
    if (!enableDrawing || !onDrawComplete) return;

    try {
      const graphicsLayer = new GraphicsLayer();
      view.map.add(graphicsLayer);

      const sketch = new SketchViewModel({
        view,
        layer: graphicsLayer,
        creationMode: 'update'
      });

      const handleCreate = (event) => {
        if (event.state === 'complete') {
          onDrawComplete(event.graphic.geometry);
        }
      };

      sketch.on('create', handleCreate);

      widgetRefs.current.sketch = sketch;

      return () => {
        sketch.off('create', handleCreate);
        sketch.destroy();
        view.map.remove(graphicsLayer);
      };
    } catch (err) {
      console.error('Drawing setup error:', err);
      ImmutableLogger.logEvent('DRAWING_SETUP_ERROR', { error: err.message }, 'system');
    }
  }, [enableDrawing, onDrawComplete]);

  const createAlertGraphic = useCallback((alert, position) => {
    return new Graphic({
      geometry: {
        type: 'point',
        longitude: position[0],
        latitude: position[1]
      },
      symbol: new SimpleMarkerSymbol({
        color: [255, 50, 50, 0.9],
        size: '18px',
        outline: {
          color: [255, 255, 255, 0.9],
          width: 3
        }
      }),
      attributes: alert,
      popupTemplate: {
        title: 'Illegal Occupation Alert',
        content: [{
          type: 'fields',
          fieldInfos: [
            { fieldName: 'title', label: 'Alert Type' },
            { fieldName: 'description', label: 'Description' },
            { fieldName: 'timestamp', label: 'Time Detected' },
            { fieldName: 'severity', label: 'Severity Level' }
          ]
        }]
      }
    });
  }, []);

  const setupGeofenceMonitoring = useCallback(async (view) => {
    if (!enableGeofenceAlerts || !modules || !user?.permissions?.includes('view_alerts')) {
      return;
    }

    try {
      let geofenceLayer = view.map.layers.find(l => l.id === 'geofence-alerts');
      if (!geofenceLayer) {
        geofenceLayer = new GraphicsLayer({
          id: 'geofence-alerts',
          title: 'Geofence Alerts',
          listMode: 'hide'
        });
        view.map.add(geofenceLayer, 0);
      }

      const protectedAreas = await this._loadProtectedAreas();
      if (!protectedAreas.length) return;

      setActiveGeofences(protectedAreas);

      const checkGeofences = () => {
        const { longitude, latitude } = view.center;
        const position = [longitude, latitude];

        protectedAreas.forEach(area => {
          if (this._geometryContains(area.geometry, view.center)) {
            const alert = {
              id: `geofence-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
              title: 'Unauthorized Land Use Detected',
              description: `Illegal occupation in protected area: ${area.attributes.name}`,
              severity: 'high',
              score: 85,
              source: 'Geofence Monitoring',
              timestamp: new Date().toISOString(),
              location: position,
              geofenceId: area.id,
              userId: user.id,
              status: 'active'
            };

            setAlerts(prev => [...prev, alert]);
            geofenceLayer.add(createAlertGraphic(alert, position));
          }
        });
      };

      positionWatcher.current = view.watch('stationary', (stationary) => {
        if (!stationary) checkGeofences();
      });

      const intervalId = setInterval(checkGeofences, GEOFENCE_CHECK_INTERVAL);

      return () => {
        positionWatcher.current?.remove();
        clearInterval(intervalId);
      };
    } catch (err) {
      console.error('Geofence error:', err);
      setMapError(`Geofence monitoring failed: ${err.message}`);
    }
  }, [enableGeofenceAlerts, modules, user?.permissions, user.id, setActiveGeofences, setAlerts, createAlertGraphic]);

  useEffect(() => {
    if (loading || !modules || isInitialized) return;

    const initMap = async () => {
      try {
        await initProjection();

        const map = new WebMap({
          basemap: Basemap.fromId(BASEMAPS.regional)
        });

        operationalLayers.forEach(layer => map.add(layer));

        const view = new MapView({
          container: mapRef.current,
          map,
          center: initialCenter,
          zoom: initialZoom,
          constraints: {
            minScale: 100000000,
            maxScale: 1000
          },
          popup: {
            dockEnabled: true,
            dockOptions: {
              position: 'top-right',
              breakpoint: false
            }
          },
          ui: {
            components: ['attribution']
          },
          locale
        });

        viewRef.current = view;

        view.when(() => {
          setIsInitialized(true);
          setupGeofenceMonitoring(view);
          setupDrawing(view);
          onMapLoad?.(view);
        });

      } catch (err) {
        const errorMsg = err.message.includes('apiKey') 
          ? 'Invalid ArcGIS API key' 
          : err.message;
        console.error('Map init error:', errorMsg);
        setMapError(`Map initialization failed: ${errorMsg}`);
      }
    };

    initMap();

    return () => {
      viewRef.current?.destroy();
      Object.values(widgetRefs.current).forEach(widget => widget?.destroy());
      positionWatcher.current?.remove();
    };
  }, [modules, loading, operationalLayers, initialCenter, initialZoom, locale, initProjection, setupGeofenceMonitoring, setupDrawing, onMapLoad, isInitialized]);

  if (loading) return <div className="map-loading">Loading map...</div>;
  if (mapError) return (
    <div className="map-error-container">
      <h3>Map Error</h3>
      <p>{mapError}</p>
      <button 
        onClick={() => setMapError(null)} 
        className="retry-button"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div ref={mapRef} className="map-container">
      {isOffline && (
        <div className="offline-indicator">
          <span className="offline-dot" />
          Offline Mode
        </div>
      )}
    </div>
  );
};

ArcGISMap.propTypes = {
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      capabilities: PropTypes.arrayOf(PropTypes.string),
      formTemplate: PropTypes.object,
      fieldConfig: PropTypes.object
    })
  ),
  onMapLoad: PropTypes.func,
  onDrawComplete: PropTypes.func,
  initialCenter: PropTypes.arrayOf(PropTypes.number),
  initialZoom: PropTypes.number,
  enableGeofenceAlerts: PropTypes.bool,
  enableDrawing: PropTypes.bool,
  enableAllocation: PropTypes.bool,
  locale: PropTypes.string,
  allocationData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      geometry: PropTypes.object.isRequired,
      applicant: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      score: PropTypes.number,
      date: PropTypes.string
    })
  ),
  tenureData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      geometry: PropTypes.object.isRequired,
      type: PropTypes.oneOf(Object.keys(TENURE_COLORS)).isRequired,
      community: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string
    })
  )
};

ArcGISMap.defaultProps = {
  initialCenter: DEFAULT_CENTER,
  initialZoom: DEFAULT_ZOOM,
  enableGeofenceAlerts: true,
  enableDrawing: true,
  enableAllocation: true,
  locale: 'en',
  allocationData: [],
  tenureData: []
};

export default ArcGISMap;