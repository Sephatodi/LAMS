/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import CryptoJS from 'crypto-js';
import KeyManagement from './KeyManagement';

class AES256Service {
  constructor() {
    this.keyManager = KeyManagement;
    this.ivLength = 16; // AES block size
  }

  async encryptData(data, keyIdentifier = 'default') {
    try {
      const key = await this.keyManager.getKey(keyIdentifier);
      const iv = CryptoJS.lib.WordArray.random(this.ivLength);
      
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        ciphertext: encrypted.toString(),
        iv: iv.toString(CryptoJS.enc.Hex),
        keyIdentifier
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  async decryptData(encryptedData) {
    try {
      const { ciphertext, iv, keyIdentifier } = encryptedData;
      const key = await this.keyManager.getKey(keyIdentifier);

      const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  async encryptField(fieldValue, keyIdentifier = 'default') {
    if (typeof fieldValue !== 'string') {
      fieldValue = JSON.stringify(fieldValue);
    }

    const key = await this.keyManager.getKey(keyIdentifier);
    return CryptoJS.AES.encrypt(fieldValue, key).toString();
  }

  async decryptField(encryptedField, keyIdentifier = 'default') {
    try {
      const key = await this.keyManager.getKey(keyIdentifier);
      const bytes = CryptoJS.AES.decrypt(encryptedField, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Field decryption failed:', error);
      throw error;
    }
  }

  async generateDataKey() {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
  }
}

export default  AES256Service();