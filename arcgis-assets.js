/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const arcgisAssets = path.join(process.cwd(), 'node_modules', '@arcgis', 'core', 'assets');
const publicAssets = path.join(process.cwd(), 'public', 'assets');

// Clear existing assets
if (fs.existsSync(publicAssets)) {
  fs.rmSync(publicAssets, { recursive: true });
}

// Create new assets directory
fs.mkdirSync(publicAssets, { recursive: true });

// Copy required assets
['esri', 'themes'].forEach(dir => {
  fs.cpSync(
    path.join(arcgisAssets, dir),
    path.join(publicAssets, dir),
    { recursive: true }
  );
});

console.log('ArcGIS assets copied successfully');