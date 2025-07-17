/** @jsxRuntime classic */
/** @jsx React.createElement */

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Query from '@arcgis/core/rest/support/Query';
import geometryEngine from '@arcgis/core/geometry/geometryEngine';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import { CalciteButton, CalciteSwitch, CalciteTab, CalciteTabs, CalcitePanel } from '@esri/calcite-components-react';
import { setAssetPath } from '@esri/calcite-components/dist/components';
import '@esri/calcite-components/dist/components/calcite-button';
import '@esri/calcite-components/dist/components/calcite-switch';
import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/themes/light/main.css';

// Set the path to Calcite assets
setAssetPath('https://unpkg.com/@esri/calcite-components/dist/calcite/assets');

// GeoServer Configuration
const GEOSERVER_CONFIG = {
  BASE_URL: process.env.REACT_APP_GEOSERVER_URL || 'http://localhost:8080/geoserver',
  WORKSPACE: 'botswana',
  LAYERS: {
    PARCELS: 'land_parcels',
    TRIBAL_BOUNDARIES: 'tribal_boundaries',
    WATER_RESOURCES: 'water_resources',
    ZONING: 'planning_zones',
    ENVIRONMENTAL: 'environmental_zones',
    INFRASTRUCTURE: 'infrastructure'
  },
  WFS_VERSION: '2.0.0',
  WMS_VERSION: '1.3.0',
  AUTH: {
    USERNAME: process.env.REACT_APP_GEOSERVER_USER || 'admin',
    PASSWORD: process.env.REACT_APP_GEOSERVER_PASS || 'geoserver'
  }
};

// Botswana-specific constants
const BOTSWANA_CONFIG = {
  DEFAULT_CENTER: [-22.3285, 24.6849],
  DEFAULT_ZOOM: 6,
  LAND_STATUS_TYPES: {
    ALLOCATED: 'allocated',
    AVAILABLE: 'available',
    DISPUTED: 'disputed',
    RESERVED: 'reserved',
    GOVERNMENT: 'government',
    COMMUNAL: 'communal',
    PRIVATE: 'private'
  },
  LAND_USE_TYPES: [
    'residential',
    'commercial',
    'agricultural',
    'industrial',
    'conservation',
    'mining',
    'community',
    'grazing',
    'tourism'
  ],
  TRIBAL_LANDS: [
    'Gaborone',
    'Francistown',
    'Maun',
    'Kasane',
    'Serowe',
    'Kanye',
    'Molepolole',
    'Mochudi',
    'Mahalapye',
    'Lobatse'
  ],
  PARCEL_STATUS_COLORS: {
    allocated: { color: [210, 47, 47, 0.7] }, // #d32f2f
    available: { color: [56, 142, 60, 0.7] },  // #388e3c
    disputed: { color: [255, 152, 0, 0.7] },   // #ff9800
    reserved: { color: [123, 31, 162, 0.7] },  // #7b1fa2
    government: { color: [25, 118, 210, 0.7] }, // #1976d2
    communal: { color: [121, 85, 72, 0.7] },   // #795548
    private: { color: [0, 150, 136, 0.7] }     // #009688
  },
  INFRASTRUCTURE_TYPES: [
    'road_access',
    'electricity',
    'water_supply',
    'sewerage',
    'telecom'
  ],
  MAX_BUFFER_DISTANCE: 5000,
  SUCCESS_STORIES: [
    "Gaborone West Extension: 500 plots allocated with full infrastructure",
    "Francistown Industrial Zone: 200ha developed for manufacturing",
    "Maun Tourism Hub: 50 luxury plots allocated near Okavango Delta"
  ]
};

// Initial state
const INITIAL_STATE = {
  parcels: [],
  filteredParcels: [],
  disputeCases: [],
  loading: {
    parcels: false,
    disputes: false,
    search: false,
    analysis: false
  },
  error: null,
  filters: {
    status: '',
    landUse: '',
    tribalLand: '',
    areaRange: [0, 10000],
    valueRange: [0, 2000],
    waterAccess: false,
    infrastructure: []
  },
  selectedParcel: null,
  bufferAnalysis: null,
  spatialQuery: null,
  activeLayers: {
    parcels: true,
    disputes: true,
    water: false,
    zoning: false,
    environmental: false,
    tribalBoundaries: true,
    infrastructure: false
  },
  auditLog: [],
  notifications: [],
  activeTab: 'layers',
  printDialogOpen: false,
  bufferDialogOpen: false,
  bufferDistance: 500,
  currentUserLocation: null,
  showHighlights: false
};

// Reducer function
function gisReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_HIGHLIGHTS':
      return { ...state, showHighlights: !state.showHighlights };
    case 'SET_PARCELS':
      return {
        ...state,
        parcels: action.payload,
        filteredParcels: filterParcels(action.payload, state.filters)
      };
    case 'SET_DISPUTE_CASES':
      return {
        ...state,
        disputeCases: action.payload
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload,
        filteredParcels: filterParcels(state.parcels, action.payload)
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, ...action.payload }
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELECTED_PARCEL':
      return { ...state, selectedParcel: action.payload };
    case 'SET_BUFFER_ANALYSIS':
      return { ...state, bufferAnalysis: action.payload };
    case 'SET_SPATIAL_QUERY':
      return { ...state, spatialQuery: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'SET_USER_LOCATION':
      return { ...state, currentUserLocation: action.payload };
    case 'TOGGLE_LAYER':
      return {
        ...state,
        activeLayers: {
          ...state.activeLayers,
          [action.payload]: !state.activeLayers[action.payload]
        }
      };
    case 'ADD_AUDIT_LOG':
      return {
        ...state,
        auditLog: [...state.auditLog, action.payload].slice(-100)
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50)
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_PRINT_DIALOG':
      return { ...state, printDialogOpen: action.payload };
    case 'TOGGLE_BUFFER_DIALOG':
      return { ...state, bufferDialogOpen: action.payload };
    case 'SET_BUFFER_DISTANCE':
      return { ...state, bufferDistance: action.payload };
    default:
      return state;
  }
}

// Filter function
function filterParcels(parcels, filters) {
  if (!parcels || parcels.length === 0) return [];
  
  return parcels.filter(parcel => {
    const props = parcel;
    const areaMatch = props.area >= filters.areaRange[0] && props.area <= filters.areaRange[1];
    const valueMatch = props.valuePerSqm >= filters.valueRange[0] && props.valuePerSqm <= filters.valueRange[1];
    const waterMatch = !filters.waterAccess || props.waterAccess;
    const infraMatch = filters.infrastructure.length === 0 || 
      filters.infrastructure.some(infra => props.infrastructure.includes(infra));
    
    return (
      (filters.status === '' || props.status === filters.status) &&
      (filters.landUse === '' || props.landUse === filters.landUse) &&
      (filters.tribalLand === '' || props.tribalLand === filters.tribalLand) &&
      areaMatch &&
      valueMatch &&
      waterMatch &&
      infraMatch
    );
  });
}

// Main GIS Analysis Component
const GISAnalysis = () => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);
  const [state, dispatch] = useReducer(gisReducer, INITIAL_STATE);
  const [mapInitialized, setMapInitialized] = useState(false);
  const parcelsLayerRef = useRef(null);
  const bufferLayerRef = useRef(null);

  // Initialize the map
  useEffect(() => {
    if (mapRef.current && !mapInitialized) {
      const map = new Map({
        basemap: 'streets-navigation-vector'
      });

      const view = new MapView({
        container: mapRef.current,
        map: map,
        center: [BOTSWANA_CONFIG.DEFAULT_CENTER[1], BOTSWANA_CONFIG.DEFAULT_CENTER[0]],
        zoom: BOTSWANA_CONFIG.DEFAULT_ZOOM
      });

      // Create parcels layer
      const parcelsLayer = new FeatureLayer({
        url: `${GEOSERVER_CONFIG.BASE_URL}/${GEOSERVER_CONFIG.WORKSPACE}/ows?service=WFS&version=${GEOSERVER_CONFIG.WFS_VERSION}&request=GetFeature&typeName=${GEOSERVER_CONFIG.WORKSPACE}:${GEOSERVER_CONFIG.LAYERS.PARCELS}&outputFormat=application/json`,
        outFields: ['*'],
        popupTemplate: {
          title: 'Parcel {plotNumber}',
          content: [
            {
              type: 'fields',
              fieldInfos: [
                { fieldName: 'tribalLand', label: 'Tribal Land' },
                { fieldName: 'status', label: 'Status' },
                { fieldName: 'landUse', label: 'Land Use' },
                { fieldName: 'area', label: 'Area (ha)' }
              ]
            }
          ]
        },
        renderer: {
          type: 'simple',
          symbol: new SimpleFillSymbol({
            color: [56, 142, 60, 0.5], // Default green color
            outline: new SimpleLineSymbol({
              color: [56, 142, 60, 1],
              width: 1
            })
          }),
          visualVariables: [{
            type: 'color',
            field: 'status',
            stops: Object.entries(BOTSWANA_CONFIG.PARCEL_STATUS_COLORS).map(([status, color]) => ({
              value: status,
              color: color.color
            }))
          }]
        }
      });

      // Create buffer analysis layer
      const bufferLayer = new GraphicsLayer();

      map.add(parcelsLayer);
      map.add(bufferLayer);

      parcelsLayerRef.current = parcelsLayer;
      bufferLayerRef.current = bufferLayer;
      viewRef.current = view;
      setMapInitialized(true);

      // Handle parcel selection
      view.on('click', async (event) => {
        const { results } = await view.hitTest(event);
        const graphic = results.find(r => r.graphic?.layer === parcelsLayer)?.graphic;
        
        if (graphic) {
          dispatch({ type: 'SET_SELECTED_PARCEL', payload: graphic.attributes });
        }
      });

      return () => {
        view.destroy();
      };
    }
  }, [mapInitialized]);

  // Load parcels data
  useEffect(() => {
    if (mapInitialized && parcelsLayerRef.current) {
      const query = parcelsLayerRef.current.createQuery();
      parcelsLayerRef.current.queryFeatures(query)
        .then(({ features }) => {
          dispatch({ type: 'SET_PARCELS', payload: features.map(f => f.attributes) });
        })
        .catch(err => {
          dispatch({ type: 'SET_ERROR', payload: err.message });
        });
    }
  }, [mapInitialized]);

  // Run buffer analysis
  const runBufferAnalysis = useCallback(async (distance) => {
    if (!state.selectedParcel || !viewRef.current || !bufferLayerRef.current) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: { analysis: true } });
      
      // Clear previous buffer graphics
      bufferLayerRef.current.removeAll();

      // Create buffer geometry
      const point = {
        type: 'point',
        longitude: state.selectedParcel.longitude,
        latitude: state.selectedParcel.latitude
      };

      const buffer = geometryEngine.geodesicBuffer(point, distance, 'meters');
      
      // Add buffer graphic
      const bufferGraphic = new Graphic({
        geometry: buffer,
        symbol: new SimpleFillSymbol({
          color: [33, 150, 243, 0.2],  // Light blue with transparency
          outline: new SimpleLineSymbol({
            color: [33, 150, 243, 1],   // Blue outline
            width: 2
          })
        })
      });

      bufferLayerRef.current.add(bufferGraphic);

      // Query parcels within buffer
      const query = new Query({
        geometry: buffer,
        spatialRelationship: 'intersects',
        returnGeometry: true,
        outFields: ['*']
      });

      const { features } = await parcelsLayerRef.current.queryFeatures(query);
      
      // Add features to buffer layer
      features.forEach(feature => {
        bufferLayerRef.current.add(new Graphic({
          geometry: feature.geometry,
          symbol: new SimpleFillSymbol({
            color: [255, 152, 0, 0.4],  // Orange with transparency
            outline: new SimpleLineSymbol({
              color: [255, 152, 0, 1],    // Orange outline
              width: 2
            })
          }),
          attributes: feature.attributes
        }));
      });

      dispatch({ 
        type: 'SET_BUFFER_ANALYSIS', 
        payload: { 
          center: state.selectedParcel,
          distance,
          features: features.map(f => f.attributes)
        }
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { analysis: false } });
    }
  }, [state.selectedParcel]);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        zIndex: 1,
        width: '350px'
      }}>
        <CalcitePanel>
          <div slot="header">
            <h3>Botswana Land Management</h3>
          </div>
          
          <CalciteTabs>
            <CalciteTab tab="filters">Filters</CalciteTab>
            <CalciteTab tab="layers">Layers</CalciteTab>
            <CalciteTab tab="tools">Tools</CalciteTab>
          </CalciteTabs>
          
          {/* Filters Tab */}
          <div id="filters">
            <div style={{ marginBottom: '1rem' }}>
              <label>Status</label>
              <select 
                value={state.filters.status}
                onChange={(e) => dispatch({ 
                  type: 'SET_FILTERS', 
                  payload: { ...state.filters, status: e.target.value }
                })}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="">All Statuses</option>
                {Object.keys(BOTSWANA_CONFIG.PARCEL_STATUS_COLORS).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Layers Tab */}
          <div id="layers">
            {Object.entries(state.activeLayers).map(([layer, active]) => (
              <div key={layer} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <CalciteSwitch
                  checked={active}
                  onCalciteSwitchChange={() => dispatch({ type: 'TOGGLE_LAYER', payload: layer })}
                />
                <span style={{ marginLeft: '0.5rem' }}>
                  {layer === 'parcels' && 'Land Parcels'}
                  {layer === 'disputes' && 'Dispute Cases'}
                  {layer === 'water' && 'Water Resources'}
                  {layer === 'zoning' && 'Planning Zones'}
                  {layer === 'environmental' && 'Environmental'}
                  {layer === 'tribalBoundaries' && 'Tribal Boundaries'}
                  {layer === 'infrastructure' && 'Infrastructure'}
                </span>
              </div>
            ))}
          </div>
          
          {/* Tools Tab */}
          <div id="tools">
            <CalciteButton 
              width="full" 
              onClick={() => dispatch({ type: 'TOGGLE_BUFFER_DIALOG', payload: true })}
              style={{ marginBottom: '1rem' }}
            >
              Buffer Analysis
            </CalciteButton>
          </div>
        </CalcitePanel>
      </div>
      
      {/* Buffer Analysis Dialog */}
      {state.bufferDialogOpen && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <h3>Buffer Analysis</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label>Distance (meters): </label>
            <input 
              type="number" 
              value={state.bufferDistance}
              onChange={(e) => dispatch({ 
                type: 'SET_BUFFER_DISTANCE', 
                payload: parseInt(e.target.value) || 0 
              })}
              min="100"
              max="5000"
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <CalciteButton 
              appearance="outline"
              onClick={() => dispatch({ type: 'TOGGLE_BUFFER_DIALOG', payload: false })}
            >
              Cancel
            </CalciteButton>
            <CalciteButton 
              onClick={() => {
                runBufferAnalysis(state.bufferDistance);
                dispatch({ type: 'TOGGLE_BUFFER_DIALOG', payload: false });
              }}
            >
              Analyze
            </CalciteButton>
          </div>
        </div>
      )}
      
      {/* Loading Indicator */}
      {state.loading.analysis && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: '1rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div className="esri-icon-loading-indicator esri-rotating" style={{ marginRight: '0.5rem' }}></div>
          <span>Running buffer analysis...</span>
        </div>
      )}
      
      {/* Error Message */}
      {state.error && (
        <div style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          zIndex: 2,
          backgroundColor: '#f44336',
          color: 'white',
          padding: '1rem',
          borderRadius: '4px',
          maxWidth: '350px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{state.error}</span>
            <button 
              onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer',
                marginLeft: '0.5rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GISAnalysis;