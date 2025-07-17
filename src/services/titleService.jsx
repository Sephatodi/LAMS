const API_BASE = '/api/titles';

// Enhanced API client with error handling, retries, and request tracking
const apiClient = {
  async request(endpoint, method = 'GET', body = null, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
      ...options.headers
    };

    const config = {
      method,
      headers,
      credentials: 'include',
      ...options
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await this.parseError(response);
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  },

  async parseError(response) {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  },

  async withRetry(fn, retries = 3, delay = 1000) {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.withRetry(fn, retries - 1, delay * 2);
    }
  }
};

// Title Service API Methods
export const titleService = {
  async registerTitle(titleData) {
    const { titleId, owner, area, coordinates, userId } = titleData;
    return apiClient.withRetry(() => 
      apiClient.request('/register', 'POST', { titleId, owner, area, coordinates, userId })
    );
  },

  async transferTitle(transferData) {
    const { titleId, newOwner, userId } = transferData;
    return apiClient.withRetry(() =>
      apiClient.request('/transfer', 'POST', { titleId, newOwner, userId })
    );
  },

  async queryTitle(titleId, options = {}) {
    return apiClient.withRetry(() =>
      apiClient.request(`/query/${titleId}`, 'GET', null, options)
    );
  },

  async getAllTitles(options = {}) {
    return apiClient.withRetry(() =>
      apiClient.request('/all', 'GET', null, options)
    );
  },

  async searchTitles(searchCriteria) {
    const { owner, minArea, maxArea, status } = searchCriteria;
    const params = new URLSearchParams();
    if (owner) params.append('owner', owner);
    if (minArea) params.append('minArea', minArea);
    if (maxArea) params.append('maxArea', maxArea);
    if (status) params.append('status', status);
    
    return apiClient.withRetry(() =>
      apiClient.request(`/search?${params.toString()}`, 'GET')
    );
  },

  async getTitleHistory(titleId) {
    return apiClient.withRetry(() =>
      apiClient.request(`/history/${titleId}`, 'GET')
    );
  },

  async verifyTitle(titleId) {
    return apiClient.withRetry(() =>
      apiClient.request(`/verify/${titleId}`, 'POST')
    );
  },

  async batchRegisterTitles(titles) {
    return apiClient.withRetry(() =>
      apiClient.request('/batch-register', 'POST', { titles })
    );
  }
};

// TypeScript support (if using TypeScript)
/**
 * @typedef {Object} TitleData
 * @property {string} titleId
 * @property {string} owner
 * @property {number} area
 * @property {string} coordinates
 * @property {string} userId
 */

/**
 * @typedef {Object} TransferData
 * @property {string} titleId
 * @property {string} newOwner
 * @property {string} userId
 */

/**
 * @typedef {Object} SearchCriteria
 * @property {string} [owner]
 * @property {number} [minArea]
 * @property {number} [maxArea]
 * @property {string} [status]
 */