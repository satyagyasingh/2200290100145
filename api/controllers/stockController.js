const stockApiService = require('../services/stockApiService');
const stockCalculations = require('../utils/stockCalculations');

/**
 * Get list of all available stocks
 */
const getAllStocks = async (req, res) => {
  try {
    const stocks = await stockApiService.getStocks();
    return res.json({ stocks });
  } catch (error) {
    console.error('Error fetching stocks:', error.message);
    return res.status(500).json({ error: 'Failed to fetch stocks' });
  }
};

/**
 * Get average stock price and price history for a specific stock
 */
const getAverageStockPrice = async (req, res) => {
  const { ticker } = req.params;
  const minutes = parseInt(req.query.minutes) || 60; // Default to 60 minutes if not specified
  
  try {
    const priceHistory = await stockApiService.getStockPriceHistory(ticker, minutes);
    
    if (!priceHistory || priceHistory.length === 0) {
      return res.status(404).json({ error: 'No price data found for this stock' });
    }
    
    const averageStockPrice = stockCalculations.calculateAveragePrice(priceHistory);
    
    return res.json({
      averageStockPrice,
      priceHistory
    });
  } catch (error) {
    console.error(`Error fetching average price for ${ticker}:`, error.message);
    return res.status(500).json({ error: `Failed to fetch average price for ${ticker}` });
  }
};

/**
 * Get correlation between two stocks
 */
const getStockCorrelation = async (req, res) => {
  const { ticker } = req.query;
  const minutes = parseInt(req.query.minutes) || 60; // Default to 60 minutes if not specified
  
  // Validate we have exactly 2 tickers
  if (!ticker || !Array.isArray(ticker) || ticker.length !== 2) {
    return res.status(400).json({ 
      error: 'Exactly 2 stock tickers are required for correlation analysis' 
    });
  }
  
  const [ticker1, ticker2] = ticker;
  
  try {
    // Fetch price histories for both stocks in parallel
    const [priceHistory1, priceHistory2] = await Promise.all([
      stockApiService.getStockPriceHistory(ticker1, minutes),
      stockApiService.getStockPriceHistory(ticker2, minutes)
    ]);
    
    if (!priceHistory1 || priceHistory1.length === 0) {
      return res.status(404).json({ error: `No price data found for ${ticker1}` });
    }
    
    if (!priceHistory2 || priceHistory2.length === 0) {
      return res.status(404).json({ error: `No price data found for ${ticker2}` });
    }
    
    // Align the time series data to ensure temporal matching
    const { alignedX, alignedY } = stockCalculations.alignTimeSeriesData(priceHistory1, priceHistory2);
    
    // Calculate correlation and averages
    const correlation = stockCalculations.calculateCorrelation(alignedX, alignedY);
    const averagePrice1 = stockCalculations.calculateAveragePrice(priceHistory1);
    const averagePrice2 = stockCalculations.calculateAveragePrice(priceHistory2);
    
    return res.json({
      correlation: parseFloat(correlation.toFixed(4)),
      stocks: {
        [ticker1]: {
          averagePrice: averagePrice1,
          priceHistory: priceHistory1
        },
        [ticker2]: {
          averagePrice: averagePrice2,
          priceHistory: priceHistory2
        }
      }
    });
  } catch (error) {
    console.error(`Error calculating correlation between ${ticker1} and ${ticker2}:`, error.message);
    return res.status(500).json({ 
      error: `Failed to calculate correlation between ${ticker1} and ${ticker2}` 
    });
  }
};

module.exports = {
  getAllStocks,
  getAverageStockPrice,
  getStockCorrelation
}; 