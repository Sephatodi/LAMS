/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';

// Common preprocessing functions
const normalize = (data, min, max) => {
  return data.map(value => (value - min) / (max - min));
};

const standardize = (data, mean, std) => {
  return data.map(value => (value - mean) / std);
};

// Land Data Preprocessing
export const preprocessLandData = (rawData, isTraining = true) => {
  const parsedData = Papa.parse(rawData, { header: true }).data;
  
  // Filter out empty rows
  const cleanData = parsedData.filter(row => 
    row.year && row.population && row.gdp && row.land_allocated
  );
  
  // Extract features and labels
  const features = cleanData.map(row => ([
    parseFloat(row.year),
    parseFloat(row.population),
    parseFloat(row.gdp),
    parseFloat(row.urbanization_rate),
    parseFloat(row.agricultural_output)
  ]));
  
  const labels = cleanData.map(row => parseFloat(row.land_allocated));
  
  if (isTraining) {
    // Calculate normalization parameters from training data
    const featureTensor = tf.tensor2d(features);
    const { mean, variance } = tf.moments(featureTensor, 0);
    const std = tf.sqrt(variance);
    
    // Normalize features
    const normalizedFeatures = features.map(featureArray => {
      return featureArray.map((value, idx) => 
        standardize([value], mean.arraySync()[idx], std.arraySync()[idx])[0]
      );
    });
    
    // Normalize labels
    const labelMin = Math.min(...labels);
    const labelMax = Math.max(...labels);
    const normalizedLabels = normalize(labels, labelMin, labelMax);
    
    // Store normalization parameters for future use
    localStorage.setItem('landNormParams', JSON.stringify({
      featureMean: mean.arraySync(),
      featureStd: std.arraySync(),
      labelMin,
      labelMax
    }));
    
    return {
      features: tf.tensor2d(normalizedFeatures),
      labels: tf.tensor1d(normalizedLabels)
    };
  } else {
    // Use stored parameters for prediction data
    const normParams = JSON.parse(localStorage.getItem('landNormParams'));
    if (!normParams) {
      throw new Error('Normalization parameters not found. Train model first.');
    }
    
    const normalizedFeatures = features.map(featureArray => {
      return featureArray.map((value, idx) => 
        standardize([value], normParams.featureMean[idx], normParams.featureStd[idx])[0]
      );
    });
    
    return {
      features: tf.tensor2d(normalizedFeatures),
      labels: null
    };
  }
};

// Fraud Data Preprocessing
export const preprocessFraudData = (rawData, isTraining = true) => {
  const parsedData = Papa.parse(rawData, { header: true }).data;
  
  // Filter out empty rows
  const cleanData = parsedData.filter(row => 
    row.applicant_age && row.application_value && row.historical_fraud && row.is_fraud
  );
  
  // Extract features and labels
  const features = cleanData.map(row => ([
    parseFloat(row.applicant_age),
    parseFloat(row.application_value),
    parseFloat(row.historical_fraud),
    parseFloat(row.previous_applications),
    parseFloat(row.distance_from_urban)
  ]));
  
  const labels = cleanData.map(row => parseFloat(row.is_fraud));
  
  if (isTraining) {
    // Calculate normalization parameters from training data
    const featureTensor = tf.tensor2d(features);
    const { mean, variance } = tf.moments(featureTensor, 0);
    const std = tf.sqrt(variance);
    
    // Normalize features
    const normalizedFeatures = features.map(featureArray => {
      return featureArray.map((value, idx) => 
        standardize([value], mean.arraySync()[idx], std.arraySync()[idx])[0]
      );
    });
    
    // Store normalization parameters for future use
    localStorage.setItem('fraudNormParams', JSON.stringify({
      featureMean: mean.arraySync(),
      featureStd: std.arraySync()
    }));
    
    return {
      features: tf.tensor2d(normalizedFeatures),
      labels: tf.tensor1d(labels)
    };
  } else {
    // Use stored parameters for prediction data
    const normParams = JSON.parse(localStorage.getItem('fraudNormParams'));
    if (!normParams) {
      throw new Error('Normalization parameters not found. Train model first.');
    }
    
    const normalizedFeatures = features.map(featureArray => {
      return featureArray.map((value, idx) => 
        standardize([value], normParams.featureMean[idx], normParams.featureStd[idx])[0]
      );
    });
    
    return {
      features: tf.tensor2d(normalizedFeatures),
      labels: null
    };
  }
};

// Helper function for processing demographic data
export const preprocessDemographicData = (rawData) => {
  const parsedData = Papa.parse(rawData, { header: true }).data;
  
  // Filter out empty rows
  const cleanData = parsedData.filter(row => 
    row.region && row.population && row.age_distribution && row.income_level
  );
  
  // Process into format suitable for visualization
  return cleanData.map(row => ({
    region: row.region,
    population: parseFloat(row.population),
    ageDistribution: JSON.parse(row.age_distribution),
    incomeLevel: parseFloat(row.income_level),
    urbanizationRate: parseFloat(row.urbanization_rate)
  }));
};