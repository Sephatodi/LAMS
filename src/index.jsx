/* eslint-disable no-unused-vars */
/** @jsxRuntime classic */
/** @jsx React.createElement */
import '@arcgis/core/assets/esri/themes/light/main.css';
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
     <AuthProvider>
        <BrowserRouter>
         <App />
        </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
