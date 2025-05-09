const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Get all stocks
router.get('/stocks', stockController.getAllStocks);

// Get average stock price for a specific stock
router.get('/stocks/:ticker', stockController.getAverageStockPrice);

// Get correlation between two stocks
router.get('/stockcorrelation', stockController.getStockCorrelation);

module.exports = router; 