/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';


export const analyzeWaterResources = (data) => {
    if (!data || !data.features) return data;
  
    // Constants for water analysis
    const WATER_QUALITY_WEIGHT = 0.4;
    const WATER_QUANTITY_WEIGHT = 0.3;
    const ACCESSIBILITY_WEIGHT = 0.2;
    const SEASONALITY_WEIGHT = 0.1;
  
    return {
      ...data,
      features: data.features.map(feature => {
        const properties = feature.properties || {};
        
        // Calculate water quality index (0-100)
        const qualityScore = Math.min(
          (properties.turbidity ? 100 - properties.turbidity : 80) * 
          (properties.contaminants ? 1 - (properties.contaminants / 1000) : 0.9),
          100
        );
  
        // Calculate quantity score based on flow rate and capacity
        const quantityScore = properties.flowRate && properties.capacity
          ? Math.min((properties.flowRate / properties.capacity) * 100, 100)
          : 50;
  
        // Calculate accessibility score
        const accessibilityScore = properties.distanceToSettlement
          ? Math.max(0, 100 - (properties.distanceToSettlement / 10))
          : 70;
  
        // Calculate seasonality factor
        const seasonalityScore = properties.seasonalVariation
          ? 100 - (properties.seasonalVariation * 20)
          : 80;
  
        // Composite water resource score
        const waterScore = 
          (qualityScore * WATER_QUALITY_WEIGHT) +
          (quantityScore * WATER_QUANTITY_WEIGHT) +
          (accessibilityScore * ACCESSIBILITY_WEIGHT) +
          (seasonalityScore * SEASONALITY_WEIGHT);
  
        return {
          ...feature,
          properties: {
            ...properties,
            waterQualityScore: Math.round(qualityScore),
            waterQuantityScore: Math.round(quantityScore),
            waterAccessibilityScore: Math.round(accessibilityScore),
            waterSeasonalityScore: Math.round(seasonalityScore),
            waterResourceScore: Math.round(waterScore),
            waterStatus: getWaterStatus(waterScore)
          }
        };
      })
    };
  };
  
  // Helper function to classify water status
  const getWaterStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Poor';
    return 'Critical';
  };
  
  // Example usage:
  // const waterData = {
  //   features: [
  //     {
  //       properties: {
  //         turbidity: 5,       // NTU (Nephelometric Turbidity Units)
  //         contaminents: 50,  // ppm
  //         flowRate: 10,      // m³/s
  //         capacity: 15,      // m³/s
  //         distanceToSettlement: 2, // km
  //         seasonalVariation: 0.3   // 0-1 scale
  //       }
  //     }
  //   ]
  // };
  // const analyzedData = analyzeWaterResources(waterData);