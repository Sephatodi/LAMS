/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

const fs = require('fs');

const files = [
  'src/Layers/WaterResourceLayer.js',
  'src/models/climateModel.js',
  'src/utils/planningTools.js'
];

files.forEach(file => {
  const content = fs.readFileSync(file);
  if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
    fs.writeFileSync(file, content.slice(3));
  }
});