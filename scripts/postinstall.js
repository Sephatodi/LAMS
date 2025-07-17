/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory path in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  // Fix ArcGIS assets resolution
  const arcgisPath = path.join('node_modules', '@arcgis', 'core');
  if (!fs.existsSync(path.join(arcgisPath, 'assets.js'))) {
    fs.writeFileSync(
      path.join(arcgisPath, 'assets.js'), 
      'export default {};'
    );
  }
  console.log('Postinstall fixes applied');
} catch (err) {
  console.error('Postinstall error:', err);
  process.exit(1);
}