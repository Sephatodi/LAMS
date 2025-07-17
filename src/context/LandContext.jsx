/** @jsxRuntime classic */
/** @jsx React.createElement */

// src/context/LandContext.js
import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { landService } from '../services/landService';
import { tribalLandService } from '../services/tribalLandService';

// Botswana-specific initial state
const initialState = {
  parcels: [],
  selectedParcel: null,
  tribalLands: [], // Botswana tribal lands data
  disputes: [],
  allocations: [],
  filters: {
    status: '',
    landUse: '',
    tribalLand: '',
    areaRange: [0, 10000],
    zoning: '',
    waterAccess: false,
    infrastructure: []
  },
  loading: false,
  error: null,
  spatialQuery: null,
  measurements: [],
  auditLog: []
};

function landReducer(state, action) {
  switch (action.type) {
    case 'SET_PARCELS':
      return { ...state, parcels: action.payload };
    case 'SET_SELECTED_PARCEL':
      return { ...state, selectedParcel: action.payload };
    case 'SET_TRIBAL_LANDS':
      return { ...state, tribalLands: action.payload };
    case 'SET_DISPUTES':
      return { ...state, disputes: action.payload };
    case 'SET_ALLOCATIONS':
      return { ...state, allocations: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SPATIAL_QUERY':
      return { ...state, spatialQuery: action.payload };
    case 'ADD_MEASUREMENT':
      return { ...state, measurements: [...state.measurements, action.payload] };
    case 'CLEAR_MEASUREMENTS':
      return { ...state, measurements: [] };
    case 'ADD_AUDIT_LOG':
      return { 
        ...state, 
        auditLog: [...state.auditLog, action.payload].slice(-100) // Keep last 100 entries
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

const LandContext = createContext();

export function LandProvider({ children }) {
  const [state, dispatch] = useReducer(landReducer, initialState);

  // Load initial data - Botswana specific data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const [parcels, tribalLands] = await Promise.all([
          landService.getAllParcels(),
          tribalLandService.getAllTribalLands()
        ]);
        
        dispatch({ type: 'SET_PARCELS', payload: parcels });
        dispatch({ type: 'SET_TRIBAL_LANDS', payload: tribalLands });
        
        // Botswana-specific initialization
        if (parcels.length > 0) {
          dispatch({ 
            type: 'ADD_AUDIT_LOG', 
            payload: {
              action: 'SYSTEM_INIT',
              message: 'Loaded initial land parcel data',
              timestamp: new Date().toISOString(),
              count: parcels.length
            }
          });
        }
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error.message || 'Failed to load initial data'
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInitialData();
  }, []);

  // Botswana-specific context methods
  const value = {
    state,
    dispatch,
    actions: {
      getParcelById: async (id) => {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const parcel = await landService.getParcelById(id);
          dispatch({ type: 'SET_SELECTED_PARCEL', payload: parcel });
          return parcel;
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      },
      createParcel: async (parcelData) => {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const newParcel = await landService.createParcel(parcelData);
          dispatch({ type: 'SET_PARCELS', payload: [...state.parcels, newParcel] });
          
          // Botswana-specific audit logging
          dispatch({
            type: 'ADD_AUDIT_LOG',
            payload: {
              action: 'PARCEL_CREATE',
              parcelId: newParcel.id,
              user: parcelData.createdBy || 'system',
              timestamp: new Date().toISOString(),
              location: newParcel.tribalLand || 'Unknown'
            }
          });
          
          return newParcel;
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      },
      allocateParcel: async (parcelId, allocationData) => {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const result = await landService.allocateParcel(parcelId, allocationData);
          
          // Update the parcel status
          const updatedParcels = state.parcels.map(p => 
            p.id === parcelId ? { ...p, status: 'allocated' } : p
          );
          
          dispatch({ type: 'SET_PARCELS', payload: updatedParcels });
          
          // Botswana-specific allocation logging
          dispatch({
            type: 'ADD_AUDIT_LOG',
            payload: {
              action: 'PARCEL_ALLOCATE',
              parcelId,
              applicant: allocationData.applicantName,
              officer: allocationData.approvedBy,
              timestamp: new Date().toISOString(),
              reference: allocationData.referenceNumber
            }
          });
          
          return result;
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message });
          throw error;
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      },
      // Add more Botswana-specific actions as needed
    }
  };

  return (
    <LandContext.Provider value={value}>
      {children}
    </LandContext.Provider>
  );
}

LandProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useLand() {
  const context = useContext(LandContext);
  if (!context) {
    throw new Error('useLand must be used within a LandProvider');
  }
  return context;
}