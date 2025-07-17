/** @jsxRuntime classic */
/** @jsx React.createElement */

import React, { useEffect, useState } from 'react';
import * as Keychain from 'react-native-keychain';

class BiometricAuth {
  constructor() {
    this.biometryType = null;
    this.isSupported = false;
    this.initialize();
  }

  async initialize() {
    try {
      const biometrics = await Keychain.getSupportedBiometryType();
      this.biometryType = biometrics;
      this.isSupported = !!biometrics;
      return this.isSupported;
    } catch (error) {
      console.error('Biometric initialization failed:', error);
      this.isSupported = false;
      return false;
    }
  }

  async authenticate(reason = 'Authenticate to access land records') {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported on this device');
    }

    try {
      const result = await Keychain.getGenericPassword({
        authenticationPrompt: {
          title: reason,
          subtitle: '',
          description: '',
          cancel: 'Cancel'
        },
        authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS
      });

      return !!result;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    }
  }

  async storeCredentials(username, password) {
    try {
      await Keychain.setGenericPassword(username, password, {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS
      });
      return true;
    } catch (error) {
      console.error('Failed to store credentials:', error);
      throw error;
    }
  }

  async getCredentials() {
    try {
      const credentials = await Keychain.getGenericPassword({
        authenticationPrompt: {
          title: 'Authenticate to retrieve credentials',
          subtitle: '',
          description: '',
          cancel: 'Cancel'
        }
      });
      return credentials;
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      throw error;
    }
  }

  async resetBiometricAuth() {
    try {
      await Keychain.resetGenericPassword();
      return true;
    } catch (error) {
      console.error('Failed to reset biometric auth:', error);
      throw error;
    }
  }
}

// React Hook for biometric authentication
export const useBiometricAuth = () => {
  const [biometricAuth, setBiometricAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const auth = new BiometricAuth();
        await auth.initialize();
        setBiometricAuth(auth);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return {
    biometricAuth,
    isLoading,
    error,
    isSupported: biometricAuth?.isSupported || false,
    biometryType: biometricAuth?.biometryType || null
  };
};

export default BiometricAuth();