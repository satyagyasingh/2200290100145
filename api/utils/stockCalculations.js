/**
 * Calculate average stock price from price history
 * @param {Array} priceHistory - Array of price objects
 * @returns {number} - Average price
 */
const calculateAveragePrice = (priceHistory) => {
  if (!priceHistory || priceHistory.length === 0) {
    return 0;
  }
  
  const sum = priceHistory.reduce((acc, item) => acc + item.price, 0);
  return sum / priceHistory.length;
};

/**
 * Calculate standard deviation of stock prices
 * @param {Array} priceHistory - Array of price objects
 * @param {number} average - Average price (pre-calculated)
 * @returns {number} - Standard deviation
 */
const calculateStandardDeviation = (priceHistory, average) => {
  if (!priceHistory || priceHistory.length <= 1) {
    return 0;
  }
  
  const squaredDifferences = priceHistory.map(item => 
    Math.pow(item.price - average, 2)
  );
  
  const sumSquaredDiff = squaredDifferences.reduce((acc, val) => acc + val, 0);
  return Math.sqrt(sumSquaredDiff / (priceHistory.length - 1));
};

/**
 * Calculate covariance between two stock price arrays
 * @param {Array} priceHistoryX - First stock's price history
 * @param {Array} priceHistoryY - Second stock's price history
 * @param {number} averageX - Average price of first stock
 * @param {number} averageY - Average price of second stock
 * @returns {number} - Covariance
 */
const calculateCovariance = (priceHistoryX, priceHistoryY, averageX, averageY) => {
  if (!priceHistoryX || !priceHistoryY || priceHistoryX.length <= 1 || priceHistoryY.length <= 1) {
    return 0;
  }
  
  // Get minimum length to ensure we don't exceed array bounds
  const minLength = Math.min(priceHistoryX.length, priceHistoryY.length);
  
  let sum = 0;
  for (let i = 0; i < minLength; i++) {
    sum += (priceHistoryX[i].price - averageX) * (priceHistoryY[i].price - averageY);
  }
  
  return sum / (minLength - 1);
};

/**
 * Calculate Pearson correlation coefficient between two stocks
 * @param {Array} priceHistoryX - First stock's price history
 * @param {Array} priceHistoryY - Second stock's price history
 * @returns {number} - Correlation coefficient (-1 to 1)
 */
const calculateCorrelation = (priceHistoryX, priceHistoryY) => {
  if (!priceHistoryX || !priceHistoryY || priceHistoryX.length <= 1 || priceHistoryY.length <= 1) {
    return 0;
  }
  
  const averageX = calculateAveragePrice(priceHistoryX);
  const averageY = calculateAveragePrice(priceHistoryY);
  
  const stdDevX = calculateStandardDeviation(priceHistoryX, averageX);
  const stdDevY = calculateStandardDeviation(priceHistoryY, averageY);
  
  if (stdDevX === 0 || stdDevY === 0) {
    return 0;
  }
  
  const covariance = calculateCovariance(priceHistoryX, priceHistoryY, averageX, averageY);
  
  return covariance / (stdDevX * stdDevY);
};

/**
 * Align time series data to ensure temporal matching
 * This function assumes that stock data might be updated at different times
 * @param {Array} priceHistoryX - First stock's price history
 * @param {Array} priceHistoryY - Second stock's price history
 * @returns {Object} - Object containing aligned price histories
 */
const alignTimeSeriesData = (priceHistoryX, priceHistoryY) => {
  if (!priceHistoryX || !priceHistoryY || priceHistoryX.length === 0 || priceHistoryY.length === 0) {
    return { alignedX: [], alignedY: [] };
  }
  
  // Sort both arrays by timestamp
  const sortedX = [...priceHistoryX].sort((a, b) => 
    new Date(a.lastUpdatedAt) - new Date(b.lastUpdatedAt)
  );
  
  const sortedY = [...priceHistoryY].sort((a, b) => 
    new Date(a.lastUpdatedAt) - new Date(b.lastUpdatedAt)
  );
  
  // Use the smaller dataset length
  const minLength = Math.min(sortedX.length, sortedY.length);
  
  return {
    alignedX: sortedX.slice(0, minLength),
    alignedY: sortedY.slice(0, minLength)
  };
};

module.exports = {
  calculateAveragePrice,
  calculateStandardDeviation,
  calculateCorrelation,
  alignTimeSeriesData
}; 