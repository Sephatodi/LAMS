// /src/services/environmentalService.js
import { spatialAnalysis } from './gisService';

class EnvironmentalService {
  constructor() {
    this.waterSourceData = null;
    this.soilDataCache = {};
  }

  async initialize() {
    // Load water source data (in a real app, this would come from an API)
    this.waterSourceData = await this._loadWaterSourceData();
  }

  async checkWaterAccess(parcelId) {
    try {
      // Get parcel geometry
      const parcel = await spatialAnalysis.getPlotData(parcelId);
      
      // Find nearest water sources within 2km
      const waterSources = this.waterSourceData.features.filter(source => {
        const distance = this._calculateDistance(
          parcel.geometry,
          source.geometry
        );
        return distance <= 2000; // 2km
      });
      
      // Calculate water access score (0-1)
      if (waterSources.length === 0) return 0;
      
      const closestDistance = Math.min(
        ...waterSources.map(source => 
          this._calculateDistance(parcel.geometry, source.geometry)
        )
      );
      
      // Normalize score (closer is better)
      return Math.max(0, 1 - (closestDistance / 2000));
    } catch (error) {
      console.error('Error checking water access:', error);
      return 0;
    }
  }

  async soilQuality(parcelId) {
    try {
      // Check cache first
      if (this.soilDataCache[parcelId]) {
        return this.soilDataCache[parcelId];
      }
      
      // Get parcel centroid
      const parcel = await spatialAnalysis.getPlotData(parcelId);
      const centroid = this._getCentroid(parcel.geometry);
      
      // In a real app, this would query a soil API
      // Mock soil quality calculation based on location
      const quality = this._simulateSoilQuality(centroid);
      
      // Cache result
      this.soilDataCache[parcelId] = quality;
      
      return quality;
    } catch (error) {
      console.error('Error checking soil quality:', error);
      return 0.5; // Default average value
    }
  }

  async floodRisk(parcelId) {
    // In a real implementation, this would use flood zone data
    const parcel = await spatialAnalysis.getPlotData(parcelId);
    const elevation = await this._getElevation(parcel.geometry);
    
    // Simple flood risk calculation based on elevation
    if (elevation < 10) return 1; // High risk
    if (elevation < 20) return 0.6; // Medium risk
    if (elevation < 50) return 0.3; // Low risk
    return 0; // Very low risk
  }

  async climateResilience(parcelId) {
    // Composite score based on multiple factors
    const [waterScore, soilScore, floodScore] = await Promise.all([
      this.checkWaterAccess(parcelId),
      this.soilQuality(parcelId),
      this.floodRisk(parcelId)
    ]);
    
    // Weighted average
    return (waterScore * 0.4) + (soilScore * 0.3) + ((1 - floodScore) * 0.3);
  }

  // Helper methods
  async _loadWaterSourceData() {
    // Mock data - in real app would come from API
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [25.0, -22.0] },
          properties: { type: "river", name: "Notwane River" }
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [25.2, -22.1] },
          properties: { type: "borehole", name: "Gaborone BH-12" }
        }
      ]
    };
  }

  _calculateDistance(geom1, geom2) {
    // Simplified distance calculation
    const coord1 = this._getCentroid(geom1);
    const coord2 = this._getCentroid(geom2);
    
    // Haversine distance would be better in real implementation
    const dx = coord1[0] - coord2[0];
    const dy = coord1[1] - coord2[1];
    return Math.sqrt(dx * dx + dy * dy) * 111320; // Convert to meters
  }

  _getCentroid(geometry) {
    // Simple centroid calculation
    if (geometry.type === "Point") return geometry.coordinates;
    
    // For polygons, use first coordinate (simplified)
    if (geometry.type === "Polygon") return geometry.coordinates[0][0];
    
    // Default to [0,0] if unknown type
    return [0, 0];
  }

  _simulateSoilQuality(coord) {
    // Mock soil quality based on location
    // In real app would use soil maps or API
    const xNorm = coord[0] - 25.0;
    const yNorm = coord[1] + 22.0;
    
    // Create artificial patterns
    const quality = 0.5 + 
      (Math.sin(xNorm * 10) * 0.2) + 
       (Math.cos(yNorm * 8) * 0.3);
    
    return Math.max(0, Math.min(1, quality));
  }

  async _getElevation(geometry) {
    // Mock elevation - in real app would use DEM
    const centroid = this._getCentroid(geometry);
    return 15 + (Math.sin(centroid[0]) * 10) + (Math.cos(centroid[1]) * 5);
  }
}

export default new EnvironmentalService();