import { useEffect, useState } from 'react';
import { loadModules } from 'esri-loader';

const options = {
  version: '4.25',
  css: true
};

export const useArcGIS = (moduleNames) => {
  const [modules, setModules] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadModules(moduleNames, options)
      .then(loadedModules => {
        setModules(loadedModules);
        setError(null);
      })
      .catch(err => {
        setError(err);
        console.error('Error loading ArcGIS modules:', err);
      })
      .finally(() => setLoading(false));
  }, [moduleNames]);

  return { modules, loading, error };
};

export default useArcGIS;