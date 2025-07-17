/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// Create a new file: src/data/tribalBoundaries.js
export const tribalLandBoundaries = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: "Gaborone",
          chief: "Kgosi Gaborone",
          landBoard: "Gaborone Land Board",
          area: 169
        },
        geometry: {
          type: "Polygon",
          coordinates: [[/* coordinates would go here */]]
        }
      },
      {
        type: "Feature",
        properties: {
          name: "Francistown",
          chief: "Kgosi Francistown",
          landBoard: "North East Land Board",
          area: 79
        },
        geometry: {
          type: "Polygon",
          coordinates: [[/* coordinates would go here */]]
        }
      }
      // Add more tribal lands as needed
    ]
  };