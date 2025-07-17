/* eslint-disable react-refresh/only-export-components */
import axios from 'axios';
import { ethers } from 'ethers';
import { createContext, useContext } from 'react';
import LandRegistryABI from '../abis/LandRegistry.json';
import PaymentChannelABI from '../abis/PaymentChannel.json';

const API_BASE_URL = '/api/blockchain';

// ==================== ETHEREUM SMART CONTRACT SERVICE ====================
class EthereumService {
  constructor() {
    this.contracts = {};
    this.provider = null;
    this.signer = null;
    this.connected = false;
    this.eventListeners = {};
  }

  async init() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        
        const network = await this.provider.getNetwork();
        
        this.contracts.landRegistry = new ethers.Contract(
          import.meta.env.VITE_LAND_REGISTRY_ADDRESS,
          LandRegistryABI,
          this.signer
        );
        
        this.contracts.paymentChannel = new ethers.Contract(
          import.meta.env.VITE_PAYMENT_CHANNEL_ADDRESS,
          PaymentChannelABI,
          this.signer
        );
        
        this.connected = true;
        return true;
      } catch (error) {
        console.error('Ethereum connection failed:', error);
        return false;
      }
    } else {
      console.error('No Ethereum provider detected');
      return false;
    }
  }

  // Land Registry Functions
  async recordTransaction(parcelId, fromAddress, toAddress, amount, documentHash) {
    if (!this.connected) await this.init();
    
    try {
      const tx = await this.contracts.landRegistry.recordTransaction(
        parcelId,
        fromAddress,
        toAddress,
        ethers.utils.parseEther(amount.toString()),
        documentHash,
        { gasLimit: 500000 }
      );
      
      return await tx.wait();
    } catch (error) {
      console.error('Transaction recording failed:', error);
      throw this.parseError(error);
    }
  }

  async getTransactionHistory(parcelId) {
    if (!this.connected) await this.init();
    
    try {
      const events = await this.contracts.landRegistry.queryFilter(
        this.contracts.landRegistry.filters.TransactionRecorded(parcelId)
      );
      
      return events.map(event => ({
        transactionId: event.args.transactionId,
        parcelId: event.args.parcelId,
        from: event.args.from,
        to: event.args.to,
        amount: ethers.utils.formatEther(event.args.amount),
        timestamp: new Date(event.args.timestamp * 1000),
        documentHash: event.args.documentHash
      }));
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      throw error;
    }
  }

  // Payment Functions
  async createPaymentChannel(invoiceId, payerAddress, amount, expiryDays) {
    if (!this.connected) await this.init();
    
    try {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + (expiryDays * 86400);
      const tx = await this.contracts.paymentChannel.createChannel(
        invoiceId,
        payerAddress,
        ethers.utils.parseEther(amount.toString()),
        expiryTimestamp,
        { gasLimit: 500000 }
      );
      
      return await tx.wait();
    } catch (error) {
      console.error('Payment channel creation failed:', error);
      throw this.parseError(error);
    }
  }

  async getPaymentChannel(invoiceId) {
    if (!this.connected) await this.init();
    
    try {
      const channel = await this.contracts.paymentChannel.channels(invoiceId);
      return {
        invoiceId,
        payer: channel.payer,
        recipient: channel.recipient,
        amount: ethers.utils.formatEther(channel.amount),
        amountPaid: ethers.utils.formatEther(channel.amountPaid),
        expiry: new Date(channel.expiry * 1000),
        status: channel.status === 0 ? 'open' : channel.status === 1 ? 'closed' : 'expired'
      };
    } catch (error) {
      console.error('Failed to fetch payment channel:', error);
      throw error;
    }
  }

  // Event Subscriptions
  subscribeToPayments(callback) {
    if (!this.connected) this.init();
    
    const paymentListener = (invoiceId, payer, amount, event) => {
      callback({
        type: 'payment',
        invoiceId,
        payer,
        amount: ethers.utils.formatEther(amount),
        transactionHash: event.transactionHash
      });
    };
    
    this.contracts.paymentChannel.on('PaymentReceived', paymentListener);
    this.eventListeners[callback] = paymentListener;
  }

  unsubscribeFromPayments(callback) {
    if (this.eventListeners[callback]) {
      this.contracts.paymentChannel.off('PaymentReceived', this.eventListeners[callback]);
      delete this.eventListeners[callback];
    }
  }

  subscribeToTransactions(callback) {
    if (!this.connected) this.init();
    
    const transactionListener = (transactionId, parcelId, from, to, amount, event) => {
      callback({
        type: 'transaction',
        transactionId,
        parcelId,
        from,
        to,
        amount: ethers.utils.formatEther(amount),
        transactionHash: event.transactionHash
      });
    };
    
    this.contracts.landRegistry.on('TransactionRecorded', transactionListener);
    this.eventListeners[callback] = transactionListener;
  }

  unsubscribeFromTransactions(callback) {
    if (this.eventListeners[callback]) {
      this.contracts.landRegistry.off('TransactionRecorded', this.eventListeners[callback]);
      delete this.eventListeners[callback];
    }
  }

  // Utility Functions
  async getCurrentAccount() {
    if (!this.connected) await this.init();
    return this.signer.getAddress();
  }

  async getBalance(address) {
    if (!this.connected) await this.init();
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  parseError(error) {
    if (error.data?.message) {
      return new Error(error.data.message);
    }
    if (error.message.includes('user rejected transaction')) {
      return new Error('Transaction was rejected by user');
    }
    return error;
  }
}

// ==================== HYPERLEDGER FABRIC SERVICE ====================
const createFabricService = () => {
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });

  const handleError = (error) => {
    console.error('Fabric service error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message;
    throw new Error(errorMessage || 'Unknown Fabric error');
  };

  return {
    // Admin Operations
    async enrollAdmin() {
      try {
        const response = await apiClient.post('/enroll-admin');
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    },

    async registerUser(userId, affiliation = 'org1.department1') {
      try {
        const response = await apiClient.post('/register-user', { userId, affiliation });
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    },

    // Chaincode Operations
    async submitTransaction(channelName, chaincodeName, functionName, args = []) {
      try {
        const response = await apiClient.post('/submit-transaction', {
          channelName,
          chaincodeName, 
          functionName,
          args
        });
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    },

    async evaluateTransaction(channelName, chaincodeName, functionName, args = []) {
      try {
        const response = await apiClient.post('/evaluate-transaction', {
          channelName,
          chaincodeName,
          functionName,
          args
        });
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    },

    // Land Title Specific
    async registerLandTitle(titleId, ownerId, parcelData) {
      try {
        const response = await apiClient.post('/land-title/register', {
          titleId,
          ownerId,
          ...parcelData
        });
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    },

    async transferLandTitle(titleId, currentOwnerId, newOwnerId) {
      try {
        const response = await apiClient.post('/land-title/transfer', {
          titleId,
          currentOwnerId,
          newOwnerId
        });
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    },

    async getLandTitleHistory(titleId) {
      try {
        const response = await apiClient.get(`/land-title/history/${titleId}`);
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    },

    async searchTitles(queryParams) {
      try {
        const response = await apiClient.get('/land-title/search', {
          params: queryParams
        });
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    },

    // System Operations
    async getNetworkStatus() {
      try {
        const response = await apiClient.get('/network-status');
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    },

    async getBlockchainHeight(channelName) {
      try {
        const response = await apiClient.get(`/blockchain-height/${channelName}`);
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    }
  };
};

// ==================== COMBINED CONTEXT PROVIDER ====================
const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
  const ethereumService = new EthereumService();
  const fabricService = createFabricService();

  const service = {
    ethereum: ethereumService,
    fabric: fabricService,
    
    // Common utilities
    async getCurrentNetwork() {
      try {
        if (ethereumService.connected) {
          const network = await ethereumService.provider.getNetwork();
          return {
            type: 'ethereum',
            name: network.name,
            chainId: network.chainId,
            provider: window.ethereum
          };
        }
        const status = await fabricService.getNetworkStatus();
        return {
          type: 'fabric',
          name: status.network,
          status: status.status
        };
      } catch (error) {
        console.error('Network detection failed:', error);
        return { type: 'unknown', error: error.message };
      }
    },

    async disconnect() {
      if (ethereumService.connected) {
        // Clear Ethereum listeners
        Object.values(ethereumService.eventListeners).forEach(listener => {
          ethereumService.contracts.paymentChannel.off('PaymentReceived', listener);
          ethereumService.contracts.landRegistry.off('TransactionRecorded', listener);
        });
        ethereumService.eventListeners = {};
        ethereumService.connected = false;
      }
    }
  };

  return (
    <BlockchainContext.Provider value={service}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

// Singleton instance for direct usage outside React
const blockchainService = {
  ethereum: new EthereumService(),
  fabric: createFabricService()
};

export default blockchainService;