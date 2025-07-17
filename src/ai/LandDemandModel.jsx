/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import * as tf from '@tensorflow/tfjs';
import { preprocessLandData } from './utils/dataPreprocessor';
import { evaluateModel } from './utils/modelEvaluator';

class LandDemandModel {
  constructor() {
    this.model = null;
    this.history = null;
  }

  async loadTrainingData() {
    // In a real implementation, this would fetch from an API or database
    const response = await fetch('/ai/trainingData/historical_allocation.csv');
    const rawData = await response.text();
    return rawData;
  }

  async createModel(inputShape) {
    this.model = tf.sequential();
    
    this.model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [inputShape]
    }));
    
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    this.model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
    
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return this.model;
  }

  async trainModel() {
    try {
      const rawData = await this.loadTrainingData();
      const { features, labels } = preprocessLandData(rawData);
      
      const inputShape = features.shape[1];
      await this.createModel(inputShape);
      
      this.history = await this.model.fit(features, labels, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
          }
        }
      });
      
      return { status: 'success', history: this.history };
    } catch (error) {
      console.error('Training failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  async predictDemand(newData) {
    if (!this.model) {
      throw new Error('Model not trained. Please train the model first.');
    }
    
    const processedData = preprocessLandData(newData, false);
    const prediction = this.model.predict(processedData);
    
    return prediction.arraySync();
  }

  async evaluate() {
    if (!this.model || !this.history) {
      throw new Error('Model not trained. Please train the model first.');
    }
    
    const rawData = await this.loadTrainingData();
    const { features, labels } = preprocessLandData(rawData);
    
    return evaluateModel(this.model, features, labels);
  }

  async saveModel() {
    if (!this.model) {
      throw new Error('Model not trained. Nothing to save.');
    }
    
    await this.model.save('indexeddb://land-demand-model');
    return { status: 'success', message: 'Model saved successfully' };
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('indexeddb://land-demand-model');
      return { status: 'success', model: this.model };
    } catch (error) {
      console.error('Error loading model:', error);
      return { status: 'error', error: error.message };
    }
  }
}

export default LandDemandModel;