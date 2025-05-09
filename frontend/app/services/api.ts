import axios from 'axios';

// Base URL for our API
const API_BASE_URL = 'http://localhost:4000';

// Stock Price History type interface
export interface StockPrice {
    price: number;
    lastUpdatedAt: string;
}

// Stock data interface
export interface Stock {
    averagePrice: number;
    priceHistory: StockPrice[];
}

// Correlation response interface
export interface CorrelationResponse {
    correlation: number;
    stocks: {
        [ticker: string]: Stock;
    };
}

// Average stock price response interface
export interface AverageStockPriceResponse {
    averageStockPrice: number;
    priceHistory: StockPrice[];
}

// Stocks list response interface
export interface StocksResponse {
    stocks: {
        [name: string]: string;
    };
}

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Get all available stocks
 */
export const getAllStocks = async (): Promise<StocksResponse> => {
    const response = await api.get('/stocks');
    return response.data;
};

/**
 * Get average stock price for a specific stock
 */
export const getAverageStockPrice = async (
    ticker: string,
    minutes?: number
): Promise<AverageStockPriceResponse> => {
    const params = minutes ? { minutes, aggregation: 'average' } : { aggregation: 'average' };
    const response = await api.get(`/stocks/${ticker}`, { params });
    return response.data;
};

/**
 * Get correlation between two stocks
 */
export const getStockCorrelation = async (
    ticker1: string,
    ticker2: string,
    minutes?: number
): Promise<CorrelationResponse> => {
    const params = {
        ticker: [ticker1, ticker2],
        minutes: minutes || 60,
    };
    const response = await api.get('/stockcorrelation', { params });
    return response.data;
};

/**
 * Generate correlation data for all stock pairs
 */
export const getCorrelationMatrix = async (
    tickers: string[],
    minutes?: number
): Promise<{ [pair: string]: number }> => {
    // Initialize result object
    const result: { [pair: string]: number } = {};

    // For each pair of tickers, get correlation
    for (let i = 0; i < tickers.length; i++) {
        for (let j = i + 1; j < tickers.length; j++) {
            try {
                const ticker1 = tickers[i];
                const ticker2 = tickers[j];

                // Get correlation data
                const correlationData = await getStockCorrelation(ticker1, ticker2, minutes);

                // Store correlation value
                result[`${ticker1}_${ticker2}`] = correlationData.correlation;
            } catch (error) {
                console.error(`Error fetching correlation for ${tickers[i]} and ${tickers[j]}:`, error);
                result[`${tickers[i]}_${tickers[j]}`] = 0;
            }
        }
    }

    return result;
};

export default api; 