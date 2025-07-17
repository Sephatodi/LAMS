/* eslint-disable no-console */
import fs from 'fs-extra';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current module's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a require function for the current module
const require = createRequire(import.meta.url);

// Get ArcGIS Core path
const arcgisCorePath = path.dirname(require.resolve('@arcgis/core/package.json'));

const destination = path.join(__dirname, '../public/assets/@arcgis/core');

console.log(`Copying ArcGIS assets from ${arcgisCorePath} to ${destination}`);

try {
  await fs.ensureDir(destination);
  await fs.copy(
    path.join(arcgisCorePath, 'assets'),
    path.join(destination, 'assets'),
    { overwrite: true }
  );
  console.log('ArcGIS assets copied successfully');
} catch (error) {
  console.error('Error copying ArcGIS assets:', error);
  process.exit(1);
}