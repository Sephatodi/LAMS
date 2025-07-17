/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

const path = require('path');
const Cesium = require('cesium');
const webpack = require('webpack');

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('/static/cesium')
      })
    ],
    resolve: {
      alias: {
        cesium: path.resolve(__dirname, 'node_modules/cesium/Source')
      }
    }
  }
};