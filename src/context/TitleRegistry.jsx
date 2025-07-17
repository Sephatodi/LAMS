/* eslint-disable react-refresh/only-export-components */
/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';
import TitleRegistry from '../hyperledger/api/TitleRegistry';

// Create context with default value
const TitleRegistryContext = React.createContext(null);

export const TitleRegistryProvider = ({ children }) => {
    // Initialize the registry instance
    const titleRegistry = new TitleRegistry();

    return (
        <TitleRegistryContext.Provider value={titleRegistry}>
            {children}
        </TitleRegistryContext.Provider>
    );
};

export const useTitleRegistry = () => {
    const context = React.useContext(TitleRegistryContext);
    if (!context) {
        throw new Error('useTitleRegistry must be used within a TitleRegistryProvider');
    }
    return context;
};

// Optional: Export the initialized instance for non-component usage
export const titleRegistryInstance = new TitleRegistry();