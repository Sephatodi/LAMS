/** @jsxRuntime classic */
/** @jsx React.createElement */

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import { useMemo } from 'react';
import { auth } from '../config/arcgis';

/**
 * Hook to create and configure the land parcel feature layer
 * @param {Object} config - Configuration options for the layer
 * @returns {FeatureLayer} Configured land parcel feature layer
 */
export const useLandParcelLayer = (config = {}) => {
  return useMemo(() => {
    const layer = new FeatureLayer({
      url: config.url || import.meta.env.VITE_LAND_PARCELS_SERVICE_URL,
      title: config.title || 'Land Parcels',
      outFields: ['*'],
      popupTemplate: {
        title: 'Parcel {ParcelID}',
        content: [{
          type: 'fields',
          fieldInfos: [
            { fieldName: 'Owner', label: 'Owner' },
            { fieldName: 'Area', label: 'Area (sqm)', format: { digitSeparator: true } },
            { fieldName: 'Zoning', label: 'Zoning Type' },
            { fieldName: 'Status', label: 'Status' },
            { fieldName: 'AllocationDate', label: 'Allocation Date' },
            { fieldName: 'LeaseExpiry', label: 'Lease Expiry' }
          ]
        }]
      },
      renderer: new UniqueValueRenderer({
        field: 'Status',
        uniqueValueInfos: [
          {
            value: 'Allocated',
            symbol: new SimpleFillSymbol({
              color: [56, 168, 0, 0.7],
              outline: { color: [34, 139, 34], width: 1 }
            }),
            label: 'Allocated'
          },
          {
            value: 'Available',
            symbol: new SimpleFillSymbol({
              color: [52, 152, 219, 0.7],
              outline: { color: [41, 128, 185], width: 1 }
            }),
            label: 'Available'
          },
          {
            value: 'Disputed',
            symbol: new SimpleFillSymbol({
              color: [231, 76, 60, 0.7],
              outline: { color: [192, 57, 43], width: 1.5 }
            }),
            label: 'Disputed'
          }
        ]
      }),
      capabilities: {
        query: true,
        editing: config.editingEnabled ? {
          allowGeometryUpdates: true,
          enableAttachments: true,
          allowOthersToUpdate: true,
          allowOthersToDelete: false
        } : undefined
      },
      authentication: config.authentication || auth,
      ...config
    });

    if (config.editingEnabled) {
      layer.on('before-apply-edits', (event) => {
        if (event.adds?.length) {
          const invalidAdds = event.adds.filter(add => !add.attributes.ParcelID);
          if (invalidAdds.length) {
            event.cancel = true;
            console.error('New parcels must have a ParcelID');
          }
        }
      });
    }

    return layer;
  }, [config]);
};

/**
 * Hook to create and configure the zoning feature layer
 * @param {Object} config - Configuration options for the layer
 * @returns {FeatureLayer} Configured zoning feature layer
 */
export const useZoningLayer = (config = {}) => {
  return useMemo(() => {
    return new FeatureLayer({
      url: config.url || import.meta.env.VITE_ZONING_SERVICE_URL,
      title: config.title || 'Zoning Areas',
      renderer: new UniqueValueRenderer({
        field: 'ZoningType',
        uniqueValueInfos: [
          {
            value: 'Residential',
            symbol: new SimpleFillSymbol({
              color: [255, 215, 0, 0.7],
              outline: { color: [255, 215, 0], width: 1 }
            }),
            label: 'Residential'
          },
          {
            value: 'Commercial',
            symbol: new SimpleFillSymbol({
              color: [255, 99, 71, 0.7],
              outline: { color: [255, 99, 71], width: 1 }
            }),
            label: 'Commercial'
          },
          {
            value: 'Agricultural',
            symbol: new SimpleFillSymbol({
              color: [50, 205, 50, 0.7],
              outline: { color: [50, 205, 50], width: 1 }
            }),
            label: 'Agricultural'
          }
        ]
      }),
      popupTemplate: {
        title: 'Zoning: {ZoningType}',
        content: [{
          type: 'fields',
          fieldInfos: [
            { fieldName: 'Description', label: 'Description' },
            { fieldName: 'Regulations', label: 'Regulations' },
            { fieldName: 'LastUpdated', label: 'Last Updated' }
          ]
        }]
      },
      authentication: config.authentication || auth,
      ...config
    });
  }, [config]);
};

/**
 * Hook to manage both land parcel and zoning layers together
 * @param {Object} config - Configuration options for both layers
 * @returns {Object} Object containing both layers
 */
export const useLandParcelLayers = (config = {}) => {
  const landParcelLayer = useLandParcelLayer(config);
  const zoningLayer = useZoningLayer(config);

  return { landParcelLayer, zoningLayer };
};

/**
 * Directly creates a land parcel feature layer (non-hook version)
 * @param {Object} config - Configuration options for the layer
 * @returns {FeatureLayer} Configured land parcel feature layer
 */
export const createLandParcelLayer = (config = {}) => {
  const layer = new FeatureLayer({
    url: config.url || import.meta.env.VITE_LAND_PARCELS_SERVICE_URL,
    title: config.title || 'Land Parcels',
    outFields: ['*'],
    popupTemplate: {
      title: 'Parcel {ParcelID}',
      content: [{
        type: 'fields',
        fieldInfos: [
          { fieldName: 'Owner', label: 'Owner' },
          { fieldName: 'Area', label: 'Area (sqm)', format: { digitSeparator: true } },
          { fieldName: 'Zoning', label: 'Zoning Type' },
          { fieldName: 'Status', label: 'Status' },
          { fieldName: 'AllocationDate', label: 'Allocation Date' },
          { fieldName: 'LeaseExpiry', label: 'Lease Expiry' }
        ]
      }]
    },
    renderer: new UniqueValueRenderer({
      field: 'Status',
      uniqueValueInfos: [
        {
          value: 'Allocated',
          symbol: new SimpleFillSymbol({
            color: [56, 168, 0, 0.7],
            outline: { color: [34, 139, 34], width: 1 }
          }),
          label: 'Allocated'
        },
        {
          value: 'Available',
          symbol: new SimpleFillSymbol({
            color: [52, 152, 219, 0.7],
            outline: { color: [41, 128, 185], width: 1 }
          }),
          label: 'Available'
        },
        {
          value: 'Disputed',
          symbol: new SimpleFillSymbol({
            color: [231, 76, 60, 0.7],
            outline: { color: [192, 57, 43], width: 1.5 }
          }),
          label: 'Disputed'
        }
      ]
    }),
    capabilities: {
      query: true,
      editing: config.editingEnabled ? {
        allowGeometryUpdates: true,
        enableAttachments: true,
        allowOthersToUpdate: true,
        allowOthersToDelete: false
      } : undefined
    },
    authentication: config.authentication || auth,
    ...config
  });

  if (config.editingEnabled) {
    layer.on('before-apply-edits', (event) => {
      if (event.adds?.length) {
        const invalidAdds = event.adds.filter(add => !add.attributes.ParcelID);
        if (invalidAdds.length) {
          event.cancel = true;
          console.error('New parcels must have a ParcelID');
        }
      }
    });
  }

  return layer;
};

/**
 * Directly creates a zoning feature layer (non-hook version)
 * @param {Object} config - Configuration options for the layer
 * @returns {FeatureLayer} Configured zoning feature layer
 */
export const createZoningLayer = (config = {}) => {
  return new FeatureLayer({
    url: config.url || import.meta.env.VITE_ZONING_SERVICE_URL,
    title: config.title || 'Zoning Areas',
    renderer: new UniqueValueRenderer({
      field: 'ZoningType',
      uniqueValueInfos: [
        {
          value: 'Residential',
          symbol: new SimpleFillSymbol({
            color: [255, 215, 0, 0.7],
            outline: { color: [255, 215, 0], width: 1 }
          }),
          label: 'Residential'
        },
        {
          value: 'Commercial',
          symbol: new SimpleFillSymbol({
            color: [255, 99, 71, 0.7],
            outline: { color: [255, 99, 71], width: 1 }
          }),
          label: 'Commercial'
        },
        {
          value: 'Agricultural',
          symbol: new SimpleFillSymbol({
            color: [50, 205, 50, 0.7],
            outline: { color: [50, 205, 50], width: 1 }
          }),
          label: 'Agricultural'
        }
      ]
    }),
    popupTemplate: {
      title: 'Zoning: {ZoningType}',
      content: [{
        type: 'fields',
        fieldInfos: [
          { fieldName: 'Description', label: 'Description' },
          { fieldName: 'Regulations', label: 'Regulations' },
          { fieldName: 'LastUpdated', label: 'Last Updated' }
        ]
      }]
    },
    authentication: config.authentication || auth,
    ...config
  });
};

export default {
  useLandParcelLayer,
  useZoningLayer,
  useLandParcelLayers,
  createLandParcelLayer,
  createZoningLayer
};