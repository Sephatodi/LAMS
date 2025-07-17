/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';
import config from '@arcgis/core/config';

// Set the assets path
config.assetsPath = 'node_modules/@arcgis/core/assets';

// Configure the ArcGIS API
config.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurJTdClG4DtiqytWI70CUlM3HZ2VtLP_SC8Wbok56oVerAYUTjefMucVl4DBPOq2SNiTMi-0peDtcfE6Ax40xn5ArW1RghDRXeGhFMxYg37iwVZyT9rpEelLUZJC3ENY7td_DMnyP9dx0O4DaeG6KH1lF9ajgBX-4vtcMENVbxlOZJvqKltu2eGleGjxWcMAbcmCW5nknJCDre63HF_seXh4.AT1_QkiMHXjM';

// Optional: Set default options
config.defaults = {
  locale: 'en'
};

// Load CSS (you can also import this in your main CSS file)
const css = document.createElement('link');
css.rel = 'stylesheet';
css.href = 'https://js.arcgis.com/4.28/@arcgis/core/assets/esri/themes/light/main.css';
document.head.appendChild(css);

export const arcgisConfig = {
  apiKey: config.apiKey
};

export const auth = {
  // your auth config
};