/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

export const GEOSERVER_CONFIG = {
  BASE_URL: 'http://localhost:8080/geoserver',
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
    USERNAME: 'admin',
    PASSWORD: 'geoserver'
  }
};

export const WFS_ENDPOINTS = {
  getParcels: (bbox = null) => {
    let url = `${GEOSERVER_CONFIG.BASE_URL}/${GEOSERVER_CONFIG.WORKSPACE}/ows?service=WFS&version=${GEOSERVER_CONFIG.WFS_VERSION}&request=GetFeature&typeName=${GEOSERVER_CONFIG.WORKSPACE}:${GEOSERVER_CONFIG.LAYERS.PARCELS}&outputFormat=application/json`;
    if (bbox) {
      url += `&bbox=${bbox.join(',')},EPSG:4326`;
    }
    return url;
  },
  getTribalBoundaries: () => `${GEOSERVER_CONFIG.BASE_URL}/${GEOSERVER_CONFIG.WORKSPACE}/ows?service=WFS&version=${GEOSERVER_CONFIG.WFS_VERSION}&request=GetFeature&typeName=${GEOSERVER_CONFIG.WORKSPACE}:${GEOSERVER_CONFIG.LAYERS.TRIBAL_BOUNDARIES}&outputFormat=application/json`,
  spatialQuery: (geometry, layer) => `${GEOSERVER_CONFIG.BASE_URL}/${GEOSERVER_CONFIG.WORKSPACE}/ows?service=WFS&version=${GEOSERVER_CONFIG.WFS_VERSION}&request=GetFeature&typeName=${GEOSERVER_CONFIG.WORKSPACE}:${layer}&outputFormat=application/json&cql_filter=INTERSECTS(geom,${encodeURIComponent(geometry)})`
};

export const WMS_ENDPOINTS = {
  getParcelTiles: () => `${GEOSERVER_CONFIG.BASE_URL}/${GEOSERVER_CONFIG.WORKSPACE}/wms?service=WMS&version=${GEOSERVER_CONFIG.WMS_VERSION}&request=GetMap&layers=${GEOSERVER_CONFIG.WORKSPACE}:${GEOSERVER_CONFIG.LAYERS.PARCELS}&styles=&format=image/png&transparent=true&width=256&height=256`
};