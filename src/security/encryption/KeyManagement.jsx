/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import CryptoJS from 'crypto-js';
import SecureStorage from 'react-native-secure-storage';

class KeyManagement {
  constructor() {
    this.keyConfig = {
      keychainService: 'gov.bw.landregistry.keys',
      keychainAccessible: 'AfterFirstUnlockThisDeviceOnly'
    };
  }

  async generateNewKey(keyIdentifier, keyLength = 256) {
    try {
      const newKey = CryptoJS.lib.WordArray.random(keyLength / 8).toString();
      await this.storeKey(keyIdentifier, newKey);
      return newKey;
    } catch (error) {
      console.error('Key generation failed:', error);
      throw error;
    }
  }

  async storeKey(keyIdentifier, key) {
    try {
      await SecureStorage.setItem(
        `enc_key_${keyIdentifier}`,
        key,
        this.keyConfig
      );
      return true;
    } catch (error) {
      console.error('Key storage failed:', error);
      throw error;
    }
  }

  async getKey(keyIdentifier) {
    try {
      const key = await SecureStorage.getItem(
        `enc_key_${keyIdentifier}`,
        this.keyConfig
      );

      if (!key) {
        throw new Error(`Key not found for identifier: ${keyIdentifier}`);
      }

      return key;
    } catch (error) {
      console.error('Key retrieval failed:', error);
      throw error;
    }
  }

  async rotateKey(keyIdentifier, newKeyLength = 256) {
    try {
      // Generate new key
      const newKey = await this.generateNewKey(keyIdentifier, newKeyLength);
      
      // In production: Implement key versioning and re-encryption of data
      return newKey;
    } catch (error) {
      console.error('Key rotation failed:', error);
      throw error;
    }
  }

  async deleteKey(keyIdentifier) {
    try {
      await SecureStorage.removeItem(
        `enc_key_${keyIdentifier}`,
        this.keyConfig
      );
      return true;
    } catch (error) {
      console.error('Key deletion failed:', error);
      throw error;
    }
  }

  async keyExists(keyIdentifier) {
    try {
      const key = await SecureStorage.getItem(
        `enc_key_${keyIdentifier}`,
        this.keyConfig
      );
      return !!key;
    } catch (error) {
      return false;
    }
  }
}

export default KeyManagement();