import axios from 'axios';
import CryptoJS from 'crypto-js';

class ImmutableLogger {
  constructor() {
    this.logBatch = [];
    this.batchSize = 5;
    this.batchTimeout = 30000;
    this.batchTimer = null;
    this.merkleRoot = null;
  }

  async logEvent(eventType, eventData, userId) {
    try {
      const timestamp = new Date().toISOString();
      const eventHash = CryptoJS.SHA256(JSON.stringify({
        eventType,
        eventData,
        userId,
        timestamp
      })).toString();

      const logEntry = {
        eventType,
        eventData,
        userId,
        timestamp,
        eventHash,
        previousHash: this.merkleRoot || 'genesis'
      };

      this.logBatch.push(logEntry);
      this.merkleRoot = CryptoJS.SHA256(
        this.merkleRoot ? 
        this.merkleRoot + eventHash : 
        eventHash
      ).toString();

      if (this.logBatch.length >= this.batchSize) {
        await this._processBatch();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this._processBatch(), this.batchTimeout);
      }

      return { success: true, eventHash };
    } catch (error) {
      console.error('Event logging failed:', error);
      throw error;
    }
  }

  async _processBatch() {
  if (this.batchTimer) {
    clearTimeout(this.batchTimer);
    this.batchTimer = null;
  }

  if (this.logBatch.length === 0) return;

  // Create a local copy of the current batch for processing
  const batchToProcess = [...this.logBatch];  
  this.logBatch = [];  // Clear the batch

  try {
    // 1. Record to blockchain (mock)
    const txResult = await this._recordToBlockchain(batchToProcess);

    // 2. Send logs to the audit API
    await axios.post(
      `${import.meta.env.VITE_AUDIT_API_URL}/logs`,
      {
        logs: batchToProcess,
        merkleRoot: this.merkleRoot,
        blockchainTxId: txResult.txId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this._getAuthToken()}`,
        },
      }
    );

    return { success: true, count: batchToProcess.length };
  } catch (error) {
    console.error('Batch processing failed:', error);
    
    // Restore logs if processing fails
    this.logBatch.unshift(...batchToProcess);  
    throw error;
  }
  }

  async _recordToBlockchain(_batch) {
    // Mock implementation - replace with actual blockchain service
    return { txId: `tx-${Date.now()}` };
  }

  async verifyLogIntegrity(logEntry) {
    try {
      const computedHash = CryptoJS.SHA256(JSON.stringify({
        eventType: logEntry.eventType,
        eventData: logEntry.eventData,
        userId: logEntry.userId,
        timestamp: logEntry.timestamp
      })).toString();

      if (computedHash !== logEntry.eventHash) {
        return { isValid: false, reason: 'Hash mismatch' };
      }

      const txData = await this._verifyBlockchainRecord(logEntry.eventHash);

      if (!txData.verified) {
        return { isValid: false, reason: 'Blockchain verification failed' };
      }

      return { isValid: true, txData };
    } catch (error) {
      console.error('Log verification failed:', error);
      throw error;
    }
  }

  async _verifyBlockchainRecord(_hash) {
    // Mock implementation
    return { verified: true };
  }

  async _getAuthToken() {
    // Implementation to get authentication token
    return 'secure-token';
  }
}

export default new ImmutableLogger();