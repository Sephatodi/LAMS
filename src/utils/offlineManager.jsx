/** @jsxRuntime classic */
/** @jsx React.createElement */


// In src/utils/offlineManager.jsx
import TileLayer from '@arcgis/core/layers/TileLayer';
// Remove problematic offline import or use correct path
//import * as offline from '@arcgis/core/workers/offline';
import * as offline from '@arcgis/core/core/workers';

export async function setupOffline(view) {
  try {
    // Check if offline is supported
    if (!offline.supported) {
      console.warn("Offline not supported in this environment");
      return;
    }

    // Setup offline tile caching
    const basemapLayer = view.map.basemap.baseLayers.items[0];
    
    if (basemapLayer instanceof TileLayer) {
      await offline.createTilePackage({
        layer: basemapLayer,
        extent: view.extent,
        title: "Land_Management_Basemap",
        compressionQuality: 80
      });
    }

    // Add sync capabilities
    const syncButton = document.createElement("button");
    syncButton.className = "esri-widget-button esri-icon-refresh";
    syncButton.title = "Sync offline edits";
    syncButton.addEventListener("click", async () => {
      try {
        await offline.sync();
        console.log("Offline edits synced successfully");
      } catch (error) {
        console.error("Error syncing offline edits:", error);
      }
    });

    view.ui.add(syncButton, "top-left");
  } catch (error) {
    console.error("Error setting up offline capabilities:", error);
  }
}

export async function checkOfflineData() {
  return await offline.checkTilePackages();
}

export async function clearOfflineData() {
  await offline.clearTilePackages();
}