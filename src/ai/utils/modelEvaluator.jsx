/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import * as tf from '@tensorflow/tfjs';

export const evaluateModel = (model, features, labels) => {
  // Make predictions
  const predictions = model.predict(features);
  
  // Calculate evaluation metrics based on model type
  if (model.layers[model.layers.length - 1].activation.constructor.name === 'Sigmoid') {
    // Binary classification (fraud detection)
    return evaluateClassificationModel(predictions, labels);
  } else {
    // Regression (land demand)
    return evaluateRegressionModel(predictions, labels);
  }
};

const evaluateClassificationModel = (predictions, labels) => {
  // Convert predictions to binary (0 or 1) using 0.5 threshold
  const binaryPreds = predictions.round();
  
  // Calculate confusion matrix
  const confusionMatrix = tf.math.confusionMatrix(labels, binaryPreds, 2);
  const [tn, fp, fn, tp] = confusionMatrix.arraySync().flat();
  
  // Calculate metrics
  const accuracy = (tp + tn) / (tp + tn + fp + fn);
  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);
  const f1Score = 2 * (precision * recall) / (precision + recall);
  
  return {
    confusionMatrix: { tn, fp, fn, tp },
    accuracy,
    precision,
    recall,
    f1Score,
    rocAuc: calculateRocAuc(predictions, labels)
  };
};

const evaluateRegressionModel = (predictions, labels) => {
  // Calculate common regression metrics
  const errors = labels.sub(predictions);
  const squaredErrors = errors.square();
  const absoluteErrors = errors.abs();
  
  const mse = squaredErrors.mean().arraySync();
  const rmse = tf.sqrt(squaredErrors.mean()).arraySync();
  const mae = absoluteErrors.mean().arraySync();
  const r2 = calculateR2Score(predictions, labels);
  
  return {
    mse,
    rmse,
    mae,
    r2
  };
};

const calculateR2Score = (predictions, labels) => {
  const ssRes = labels.sub(predictions).square().sum().arraySync();
  const meanLabel = labels.mean().arraySync();
  const ssTot = labels.sub(meanLabel).square().sum().arraySync();
  
  return 1 - (ssRes / ssTot);
};

const calculateRocAuc = async (predictions, labels) => {
  // This is a simplified implementation - in production you'd want a more robust method
  const thresholds = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const tpr = [];
  const fpr = [];
  
  for (const threshold of thresholds) {
    const binaryPreds = predictions.greater(tf.scalar(threshold));
    const confusionMatrix = tf.math.confusionMatrix(labels, binaryPreds, 2);
    const [tn, fp, fn, tp] = confusionMatrix.arraySync().flat();
    
    tpr.push(tp / (tp + fn));
    fpr.push(fp / (fp + tn));
  }
  
  // Calculate AUC using trapezoidal rule
  let auc = 0;
  for (let i = 1; i < tpr.length; i++) {
    auc += (fpr[i] - fpr[i - 1]) * (tpr[i] + tpr[i - 1]) / 2;
  }
  
  return auc;
};

export const generateLearningCurves = (history) => {
  if (!history || !history.history) {
    return null;
  }
  
  const { loss, val_loss, acc, val_acc } = history.history;
  
  return {
    loss: loss.map((val, epoch) => ({ epoch: epoch + 1, value: val })),
    valLoss: val_loss.map((val, epoch) => ({ epoch: epoch + 1, value: val })),
    accuracy: acc ? acc.map((val, epoch) => ({ epoch: epoch + 1, value: val })) : null,
    valAccuracy: val_acc ? val_acc.map((val, epoch) => ({ epoch: epoch + 1, value: val })) : null
  };
};