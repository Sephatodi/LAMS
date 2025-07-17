import config from '@arcgis/core/config';

export function initializeArcGIS() {
  config.assetsPath = './assets/@arcgis/core/assets';
  config.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;
  config.workers.loaderConfig = {
    paths: {
      '@arcgis/core': './assets/@arcgis/core'
    }
  };
}