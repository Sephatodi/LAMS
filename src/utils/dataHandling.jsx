/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// src/utils/dataHandling.js
import * as turf from '@turf/turf';

// Fallback logger implementation
const fallbackLogger = {
  error: (message, context) => console.error(`[ERROR] ${message}`, context),
  warn: (message, context) => console.warn(`[WARN] ${message}`, context),
  info: (message, context) => console.log(`[INFO] ${message}`, context),
  debug: (message, context) => console.debug(`[DEBUG] ${message}`, context)
};

// Fallback schema validator
const fallbackSchemaValidator = {
  waterSchema: {
    validate: (data) => ({
      valid: true,
      errors: [],
      normalized: data
    })
  }
};

// Try to import actual implementations
let schemaValidator;
let logger;

try {
  schemaValidator = (await import('./validationSchema')).schemaValidator;
} catch (e) {
  console.warn('schemaValidator not found - using fallback');
  schemaValidator = fallbackSchemaValidator;
}

try {
  logger = (await import('./logger')).logger;
} catch (e) {
  console.warn('logger not found - using console fallback');
  logger = fallbackLogger;
}

/**
 * Validates water infrastructure data against schema with enhanced error handling
 * @param {Object} data - GeoJSON data to validate
 * @param {boolean} [throwOnError=true] - Whether to throw on validation errors
 * @returns {Object} {valid: boolean, data: Object|null, errors: Array|null}
 */
export const validateWaterData = (data) => {
  try {
    const { valid, errors, normalized } = schemaValidator.waterSchema.validate(data);
    
    if (!valid) {
      const errorMessages = errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      logger.error('Validation failed', { errors: errorMessages });
      throw new Error(`Invalid data format: ${errorMessages.join(', ')}`);
    }
    
    logger.info('Data validation successful');
    return normalized;
  } catch (error) {
    logger.error('Validation error', { error: error.message });
    throw error;
  }
}

// Constants for water infrastructure calculations
const DEFAULT_VELOCITY = 1.5; // m/s
const MIN_PIPE_DIAMETER = 0.05; // meters
const MAX_PIPE_DIAMETER = 2.5; // meters
const SIMPLIFICATION_TOLERANCE = 0.001; // simplification tolerance in degrees


/**
 * Applies transformations to water data for optimal rendering and analysis
 * @param {Object} data - Validated GeoJSON data
 * @param {Object} [options={}] - Transformation options
 * @param {number} [options.tolerance=SIMPLIFICATION_TOLERANCE] - Simplification tolerance
 * @param {boolean} [options.calculateMetrics=true] - Whether to calculate metrics
 * @returns {Object} Transformed GeoJSON data
 */
export const transformWaterData = (data, options = {}) => {
  const {
    tolerance = SIMPLIFICATION_TOLERANCE,
    calculateMetrics = true
  } = options;

  try {
    // Clone the data to avoid mutating the original
    const transformed = JSON.parse(JSON.stringify(data));
    
    // Simplify complex geometries for performance
    const simplified = turf.simplify(transformed, { 
      tolerance,
      highQuality: true,
      mutate: false
    });

    if (!calculateMetrics) {
      return simplified;
    }

    // Add calculated properties and metrics
    simplified.features = simplified.features.map(feature => {
      const properties = { ...feature.properties };
      
      // Calculate length for linear features
      if (feature.geometry.type === 'LineString') {
        properties.calculated_length = turf.length(feature, { units: 'meters' });
      }
      
      // Calculate area for polygonal features
      if (feature.geometry.type === 'Polygon') {
        properties.calculated_area = turf.area(feature);
      }
      
      // Estimate diameter if not provided
      if (!properties.diameter && properties.flow_capacity) {
        properties.estimated_diameter = calculatePipeDiameter(
          properties.flow_capacity,
          properties.fluid_type
        );
      }
      
      return {
        ...feature,
        properties
      };
    });

    return simplified;
  } catch (error) {
    logger.error('Data transformation failed', error);
    throw new Error('Failed to transform water infrastructure data');
  }
};

/**
 * Calculates pipe diameter based on flow capacity and fluid type
 * @param {number} flowCapacity - Flow capacity in m³/s
 * @param {string} [fluidType='water'] - Type of fluid in pipe
 * @returns {number} Estimated diameter in meters
 */
export const calculatePipeDiameter = (flowCapacity, fluidType = 'water') => {
  if (!flowCapacity || flowCapacity <= 0) {
    return MIN_PIPE_DIAMETER;
  }

  // Adjust velocity based on fluid type
  const velocity = getFluidVelocity(fluidType);
  
  // Basic hydraulic calculation (Q = v*A)
  const area = flowCapacity / velocity;
  const diameter = Math.sqrt((4 * area) / Math.PI);
  
  // Constrain to reasonable pipe sizes
  return Math.max(
    MIN_PIPE_DIAMETER, 
    Math.min(diameter, MAX_PIPE_DIAMETER)
  );
};

/**
 * Gets typical velocity for different fluid types
 * @param {string} fluidType - Type of fluid
 * @returns {number} Typical velocity in m/s
 */
const getFluidVelocity = (fluidType) => {
  const velocities = {
    water: 1.5,
    sewage: 0.8,
    stormwater: 1.2,
    gas: 10.0,
    oil: 2.0
  };
  
  return velocities[fluidType?.toLowerCase()] || DEFAULT_VELOCITY;
};

/**
 * Filters water features by specified criteria
 * @param {Object} data - GeoJSON data
 * @param {Object} filters - Filter criteria
 * @returns {Object} Filtered GeoJSON data
 */
export const filterWaterFeatures = (data, filters = {}) => {
  if (!data?.features) return data;
  
  const filteredFeatures = data.features.filter(feature => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null) return true;
      
      // Handle nested properties (e.g., 'properties.diameter')
      const propPath = key.split('.');
      const propValue = propPath.reduce((obj, prop) => obj?.[prop], feature);
      
      // Handle array values (e.g., material in ['PVC', 'HDPE'])
      if (Array.isArray(value)) {
        return value.includes(propValue);
      }
      
      // Handle range filters (e.g., {min: 0.1, max: 0.5})
      if (typeof value === 'object' && (value.min !== undefined || value.max !== undefined)) {
        return (
          (value.min === undefined || propValue >= value.min) &&
          (value.max === undefined || propValue <= value.max)
        );
      }
      
      return propValue === value;
    });
  });
  
  return {
    ...data,
    features: filteredFeatures
  };
};

/**
 * Calculates network connectivity metrics
 * @param {Object} networkData - GeoJSON LineString features representing pipes
 * @returns {Object} Connectivity metrics
 */
export const calculateNetworkConnectivity = (networkData) => {
  if (!networkData?.features) {
    throw new Error('Invalid network data');
  }

  const nodes = new Set();
  const connections = new Map();
  
  networkData.features.forEach(feature => {
    if (feature.geometry.type !== 'LineString') return;
    
    const coords = feature.geometry.coordinates;
    const startNode = coords[0].join(',');
    const endNode = coords[coords.length - 1].join(',');
    
    nodes.add(startNode);
    nodes.add(endNode);
    
    // Record connections
    [startNode, endNode].forEach(node => {
      if (!connections.has(node)) {
        connections.set(node, new Set());
      }
    });
    
    connections.get(startNode).add(endNode);
    connections.get(endNode).add(startNode);
  });
  
  // Calculate basic metrics
  const nodeCount = nodes.size;
  const edgeCount = networkData.features.length;
  const isolatedNodes = [...nodes].filter(node => 
    connections.get(node).size === 0
  ).length;
  
  return {
    nodeCount,
    edgeCount,
    isolatedNodes,
    connectivityRatio: edgeCount / Math.max(1, nodeCount),
    isFullyConnected: isolatedNodes === 0
  };
};