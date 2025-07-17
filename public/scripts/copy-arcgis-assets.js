import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '../node_modules/@arcgis/core/assets');
const destination = path.join(__dirname, '../public/assets/@arcgis/core/assets');

try {
  // Create destination directory if it doesn't exist
  fs.ensureDirSync(destination);
  
  // Copy files
  fs.copySync(source, destination, {
    overwrite: true,
    errorOnExist: false
  });
  
  console.log('ArcGIS assets copied successfully!');
} catch (err) {
  console.error('Error copying ArcGIS assets:', err);
  process.exit(1);
}