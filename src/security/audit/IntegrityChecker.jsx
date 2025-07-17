/** @jsxRuntime classic */
/** @jsx React.createElement */

import axios from 'axios';
import CryptoJS from 'crypto-js';
import ImmutableLogger from './ImmutableLogger';

class IntegrityChecker {
  constructor() {
    this.checksumCache = new Map();
  }

  async generateChecksum(data) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    return CryptoJS.SHA3(data, { outputLength: 512 }).toString();
  }

  async verifyDataIntegrity(data, expectedChecksum) {
    try {
      const currentChecksum = await this.generateChecksum(data);
      return {
        isValid: currentChecksum === expectedChecksum,
        currentChecksum,
        expectedChecksum
      };
    } catch (error) {
      console.error('Integrity verification failed:', error);
      throw error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async monitorDataChanges(dataType, fetchDataFn, _interval = 3600000) {
    try {
      const data = await fetchDataFn();
      const checksum = await this.generateChecksum(data);

      if (this.checksumCache.has(dataType)) {
        const previousChecksum = this.checksumCache.get(dataType);
        if (previousChecksum !== checksum) {
          await ImmutableLogger.logEvent(
            'DATA_CHANGE_DETECTED',
            { dataType, previousChecksum, newChecksum: checksum },
            'system'
          );
        }
      }

      this.checksumCache.set(dataType, checksum);
      return { success: true, checksum };
    } catch (error) {
      console.error('Data change monitoring failed:', error);
      throw error;
    }
  }

  async validateDatabaseRecords(records, keyField = 'id') {
    try {
      const invalidRecords = [];
      const validationPromises = records.map(async (record) => {
        const expectedHash = record._integrityHash;
        if (!expectedHash) {
          invalidRecords.push({ record, reason: 'Missing integrity hash' });
          return;
        }

        // Clone record and remove hash field for validation
        const recordClone = { ...record };
        delete recordClone._integrityHash;

        const currentHash = await this.generateChecksum(recordClone);
        if (currentHash !== expectedHash) {
          invalidRecords.push({
            key: record[keyField],
            reason: 'Hash mismatch',
            expectedHash,
            currentHash
          });
        }
      });

      await Promise.all(validationPromises);

      if (invalidRecords.length > 0) {
        await ImmutableLogger.logEvent(
          'DATA_INTEGRITY_FAILURE',
          { invalidRecordsCount: invalidRecords.length, dataType: 'database_records' },
          'system'
        );
      }

      return {
        totalRecords: records.length,
        invalidRecordsCount: invalidRecords.length,
        invalidRecords
      };
    } catch (error) {
      console.error('Record validation failed:', error);
      throw error;
    }
  }

  async verifyBlockchainConsistency() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BLOCKCHAIN_URL}/consistency-check`,
        {
          headers: {
            'Authorization': `Bearer ${await this._getAuthToken()}`
          }
        }
      );

      if (response.data.inconsistencies.length > 0) {
        await ImmutableLogger.logEvent(
          'BLOCKCHAIN_INCONSISTENCY',
          response.data,
          'system'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Blockchain consistency check failed:', error);
      throw error;
    }
  }

  async _getAuthToken() {
    // Implementation to get authentication token
    return 'secure-token';
  }
}

export default IntegrityChecker();