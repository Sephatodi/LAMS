import { loadModules } from 'esri-loader';

const options = {
  version: '4.32', // matches your package.json version
  css: true
};

export const loadArcGISModules = async (modules) => {
  return await loadModules(modules, options);
};