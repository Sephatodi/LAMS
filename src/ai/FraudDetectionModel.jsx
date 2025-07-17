/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import * as tf from '@tensorflow/tfjs';
import { preprocessFraudData } from './utils/dataPreprocessor';
import { evaluateModel } from './utils/modelEvaluator';

class FraudDetectionModel {
  constructor() {
    this.model = null;
    this.threshold = 0.7; // Default threshold for fraud classification
    this.history = null;
  }

  async loadTrainingData() {
    // In a real implementation, this would fetch from an API or database
    const response = await fetch('/ai/trainingData/fraud_cases.csv');
    const rawData = await response.text();
    return rawData;
  }

  async createModel(inputShape) {
    this.model = tf.sequential();
    
    this.model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      inputShape: [inputShape]
    }));
    
    this.model.add(tf.layers.dropout({ rate: 0.3 }));
    this.model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    
    this.model.compile({
      optimizer: tf.train.adam(0.0005),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });
    
    return this.model;
  }

  async trainModel() {
    try {
      const rawData = await this.loadTrainingData();
      const { features, labels } = preprocessFraudData(rawData);
      
      const inputShape = features.shape[1];
      await this.createModel(inputShape);
      
      this.history = await this.model.fit(features, labels, {
        epochs: 50,
        batchSize: 64,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs.loss}, acc = ${logs.acc}`);
          }
        }
      });
      
      return { status: 'success', history: this.history };
    } catch (error) {
      console.error('Training failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  async detectFraud(newData) {
    if (!this.model) {
      throw new Error('Model not trained. Please train the model first.');
    }
    
    const processedData = preprocessFraudData(newData, false);
    const predictions = this.model.predict(processedData);
    const fraudProbabilities = predictions.arraySync();
    
    // Classify based on threshold
    const results = fraudProbabilities.map(prob => ({
      probability: prob[0],
      isFraud: prob[0] >= this.threshold
    }));
    
    return results;
  }

  setThreshold(newThreshold) {
    if (newThreshold >= 0 && newThreshold <= 1) {
      this.threshold = newThreshold;
      return { status: 'success', newThreshold };
    }
    return { status: 'error', message: 'Threshold must be between 0 and 1' };
  }

  async evaluate() {
    if (!this.model || !this.history) {
      throw new Error('Model not trained. Please train the model first.');
    }
    
    const rawData = await this.loadTrainingData();
    const { features, labels } = preprocessFraudData(rawData);
    
    return evaluateModel(this.model, features, labels);
  }

  async saveModel() {
    if (!this.model) {
      throw new Error('Model not trained. Nothing to save.');
    }
    
    await this.model.save('indexeddb://fraud-detection-model');
    return { status: 'success', message: 'Model saved successfully' };
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('indexeddb://fraud-detection-model');
      return { status: 'success', model: this.model };
    } catch (error) {
      console.error('Error loading model:', error);
      return { status: 'error', error: error.message };
    }
  }
}

export default FraudDetectionModel;