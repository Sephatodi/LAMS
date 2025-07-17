/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

const styles = {
    wizardContainer: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    },
    progressBar: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '30px',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        height: '2px',
        backgroundColor: '#e0e0e0',
        zIndex: '1'
      }
    },
    step: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      zIndex: '2',
      cursor: 'pointer'
    },
    active: {
      '& $stepNumber': {
        backgroundColor: '#4CAF50',
        color: '#fff'
      },
      '& $stepTitle': {
        color: '#4CAF50',
        fontWeight: 'bold'
      }
    },
    stepNumber: {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      backgroundColor: '#e0e0e0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '5px'
    },
    stepTitle: {
      fontSize: '12px',
      color: '#757575'
    },
    formStep: {
      marginBottom: '20px'
    },
    stepHeader: {
      marginBottom: '20px',
      color: '#333'
    },
    formGroup: {
      marginBottom: '15px'
    },
    error: {
      borderColor: '#f44336 !important'
    },
    errorMessage: {
      color: '#f44336',
      fontSize: '12px',
      marginTop: '5px'
    },
    navigationButtons: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px'
    },
    primaryButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    secondaryButton: {
      backgroundColor: '#f0f0f0',
      color: '#333',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    submitButton: {
      backgroundColor: '#2196F3',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      '&:disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed'
      }
    }
  };
  
  export default styles;