/** @jsxRuntime classic */
/** @jsx React.createElement */

import * as Cesium from 'cesium';
import React, { useEffect, useMemo, useState } from 'react';
import { Entity, Globe, Viewer } from 'resium';
import { landSuitabilityAnalysis } from '../utils/planningTools';

const PlanningZonesLayer = () => {
  const [terrainProvider, setTerrainProvider] = useState();
  const [zoningData, setZoningData] = useState(null);

  useEffect(() => {
    setTerrainProvider(new Cesium.CesiumTerrainProvider({
      url: Cesium.IonResource.fromAssetId(1),
      requestVertexNormals: true,
      requestWaterMask: true
    }));
  }, []);

  // Add data fetching logic
  useEffect(() => {
    // Implement actual data fetching
    const fetchZoningData = async () => {
      // Add your data fetching logic here
      return { features: [] };
    };
    fetchZoningData().then(setZoningData);
  }, []);

  const processedData = useMemo(() => 
    (zoningData?.features || []).map(feature => ({
      ...feature,
      properties: {
        ...feature.properties,
        suitability: landSuitabilityAnalysis(feature)
      }
    })), [zoningData]);

  return (
    <Viewer terrainProvider={terrainProvider}>
      <Globe terrainProvider={terrainProvider} />
      {processedData.map((feature, idx) => (
        <Entity
          key={idx}
          polygon={{ hierarchy: feature.geometry.coordinates }}
          material={Cesium.Color.fromHsl(
            feature.properties.suitability/100,
            1,
            0.5,
            0.4
          )}
        />
      ))}
    </Viewer>
  );
};

export default PlanningZonesLayer;