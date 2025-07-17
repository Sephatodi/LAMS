/** @jsxRuntime classic */
/** @jsx React.createElement */


import { Box, Typography } from "@mui/material";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import  React, { useEffect, useState } from "react";
import { MapContainer, Polygon, Popup, TileLayer } from "react-leaflet";

const MapVisualization = ({ landParcelId }) => {
  const [landParcel, setLandParcel] = useState(null);

  // Fetch land parcel data if landParcelId is provided
  useEffect(() => {
    const defaultParcel = {
      coordinates: [
        [-1.939, 30.104],
        [-1.936, 30.102],
        [-1.935, 30.106],
      ],
      plots: [],
    };

    if (landParcelId) {
      axios
        .get(`/api/map/land-parcel/${landParcelId}`)
        .then((response) => setLandParcel(response.data))
        .catch((error) => console.error("Error fetching land parcel:", error));
    } else {
      setLandParcel(defaultParcel); // Use default parcel if no ID is provided
    }
  }, [landParcelId]); // Remove defaultParcel from dependencies

  if (!landParcel) return <div>Loading...</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Land Parcel Visualization
      </Typography>
      <MapContainer
        center={landParcel.coordinates[0]} // Use the first coordinate as the center
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        {/* Tile Layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Land Parcel Polygon */}
        <Polygon positions={landParcel.coordinates} color="blue">
          <Popup>
            <div>
              <h3>Land Parcel</h3>
              <p>Total Plots: {landParcel.plots.length}</p>
            </div>
          </Popup>
        </Polygon>

        {/* Plot Polygons */}
        {landParcel.plots.map((plot) => (
          <Polygon key={plot.plotId} positions={plot.coordinates} color="green">
            <Popup>
              <div>
                <h3>Plot {plot.plotId}</h3>
                <p>Size: {plot.size} sqm</p>
                <p>Zoning: {plot.zoning}</p>
              </div>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>
    </Box>
  );
};

export default MapVisualization;