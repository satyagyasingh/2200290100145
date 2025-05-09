const axios = require('axios');
const config = require('../config');
const NodeCache = require('node-cache');

// Cache to store auth token
const tokenCache = new NodeCache({ stdTTL: 3600 }); // TTL: 1 hour
// Cache to store stock data
const stockCache = new NodeCache({ stdTTL: 60 }); // TTL: 1 minute

/**
 * Get authentication token from the API
 */
const getAuthToken = async () => {
  const cachedToken = tokenCache.get('authToken');
  if (cachedToken) return cachedToken;

  try {
    const response = await axios.post(`${config.apiUrl}/auth`, {
      email: config.email,
      name: config.name,
      rollNo: config.rollNo,
      accessCode: config.accessCode,
      clientID: config.clientId,
      clientSecret: config.clientSecret
    });

    const token = response.data.access_token;
    tokenCache.set('authToken', token);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error.message);
    throw new Error('Failed to authenticate with the stock exchange API');
  }
};

/**
 * Create axios instance with auth header
 */
const createAuthenticatedClient = async () => {
  const token = await getAuthToken();
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Get all available stocks
 */
const getStocks = async () => {
  const cachedStocks = stockCache.get('allStocks');
  if (cachedStocks) return cachedStocks;

  try {
    const client = await createAuthenticatedClient();
    const response = await client.get(`${config.apiUrl}/stocks`);
    stockCache.set('allStocks', response.data.stocks);
    return response.data.stocks;
  } catch (error) {
    console.error('Error fetching stocks:', error.message);
    throw new Error('Failed to fetch stocks from the API');
  }
};

/**
 * Get stock price history
 */
const getStockPriceHistory = async (ticker, minutes) => {
  const cacheKey = `stock_${ticker}_${minutes || 'latest'}`;
  const cachedData = stockCache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const client = await createAuthenticatedClient();
    let url = `${config.apiUrl}/stocks/${ticker}`;
    if (minutes) {
      url += `?minutes=${minutes}`;
    }
    
    const response = await client.get(url);
    const data = minutes ? response.data : [response.data.stock];
    stockCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching stock price history for ${ticker}:`, error.message);
    throw new Error(`Failed to fetch stock price history for ${ticker}`);
  }
};

module.exports = {
  getStocks,
  getStockPriceHistory,
  createAuthenticatedClient,
  getAuthToken
}; 