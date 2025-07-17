/** @jsxRuntime classic */
/** @jsx React.createElement */

import { loadPyodide } from 'pyodide';
import React, { useEffect, useRef } from 'react';
import { GeoJSON } from 'react-leaflet';
import { climateModel } from '../models/climateModel';

class EnvironmentalAnalyzer {
  constructor() {
    this.pyodide = null;
  }

  async initialize() {
    this.pyodide = await loadPyodide();
    await this.pyodide.loadPackage(['numpy', 'pandas']);
  }

  async analyze(feature) {
    // Run Python-based climate models
    return this.pyodide.runPythonAsync(`
      import climate_model
      climate_model.assess_risk(${JSON.stringify(feature)})
    `);
  }
}

const EnvironmentalLayer = ({ ecoData }) => {
  const analyzer = useRef(new EnvironmentalAnalyzer());

  useEffect(() => {
    analyzer.current.initialize();
  }, []);

  const riskStyle = async (feature) => {
    const analysis = await climateModel.assessRisk(feature);
    return {
      color: analysis.riskLevel > 7 ? '#d32f2f' : '#388e3c',
      weight: analysis.riskLevel / 2
    };
  };

  return ecoData ? (
    <GeoJSON
      data={ecoData}
      style={riskStyle}
      onEachFeature={async (feature, layer) => {
        const analysis = await analyzer.current.analyze(feature);
        layer.bindPopup(`
          <h3>Environmental Risk Assessment</h3>
          <p>Flood Risk: ${analysis.flood_risk}/10</p>
          <p>Biodiversity Impact: ${analysis.biodiversity_impact}</p>
          <p>Carbon Sequestration: ${analysis.carbon_metric} tCO2/ha</p>
        `);
      }}
    />
  ) : null;
};

export default EnvironmentalLayer;