/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// AutomatedPlotDesign.js
import { terrainAnalysis } from './gisAnalysis';
import { optimizePlotLayout } from './layoutAlgorithms';
import { BOTSWANA_STANDARDS } from './standards';

class AutomatedPlotDesign {
  constructor(geoData) {
    this.geoData = geoData;
    this.terrain = null;
    this.plotLayout = null;
  }

  async analyzeTerrain() {
    try {
      this.terrain = await terrainAnalysis(this.geoData);
      return this.terrain;
    } catch (error) {
      console.error('Terrain analysis failed:', error);
      throw new Error('Failed to analyze terrain');
    }
  }

  generatePlotLayout(landUseType) {
    const standards = BOTSWANA_STANDARDS[landUseType] || BOTSWANA_STANDARDS.default;
    
    this.plotLayout = optimizePlotLayout({
      terrain: this.terrain,
      plotSizes: standards.plotSizes,
      roadWidth: standards.roadWidth,
      utilityCorridors: standards.utilityCorridors
    });
    
    return this.plotLayout;
  }

  assignPlotNumbers() {
    if (!this.plotLayout) {
      throw new Error('Generate plot layout first');
    }
    
    return this.plotLayout.features.map((feature, index) => ({
      ...feature,
      properties: {
        ...feature.properties,
        plotNumber: this.generateBotswanaPlotNumber(index)
      }
    }));
  }

  generateBotswanaPlotNumber(index) {
    const districtCode = this.geoData.district.substring(0, 3).toUpperCase();
    return `${districtCode}-${(index + 1).toString().padStart(4, '0')}`;
  }
}// AutomatedPlotDesign.js
import { terrainAnalysis } from './gisAnalysis';
import { optimizePlotLayout } from './layoutAlgorithms';
import { BOTSWANA_STANDARDS } from './standards';

class AutomatedPlotDesign {
  constructor(geoData) {
    this.geoData = geoData;
    this.terrain = null;
    this.plotLayout = null;
  }

  async analyzeTerrain() {
    try {
      this.terrain = await terrainAnalysis(this.geoData);
      return this.terrain;
    } catch (error) {
      console.error('Terrain analysis failed:', error);
      throw new Error('Failed to analyze terrain');
    }
  }

  generatePlotLayout(landUseType) {
    const standards = BOTSWANA_STANDARDS[landUseType] || BOTSWANA_STANDARDS.default;
    
    this.plotLayout = optimizePlotLayout({
      terrain: this.terrain,
      plotSizes: standards.plotSizes,
      roadWidth: standards.roadWidth,
      utilityCorridors: standards.utilityCorridors
    });
    
    return this.plotLayout;
  }

  assignPlotNumbers() {
    if (!this.plotLayout) {
      throw new Error('Generate plot layout first');
    }
    
    return this.plotLayout.features.map((feature, index) => ({
      ...feature,
      properties: {
        ...feature.properties,
        plotNumber: this.generateBotswanaPlotNumber(index)
      }
    }));
  }

  generateBotswanaPlotNumber(index) {
    const districtCode = this.geoData.district.substring(0, 3).toUpperCase();
    return `${districtCode}-${(index + 1).toString().padStart(4, '0')}`;
  }
}