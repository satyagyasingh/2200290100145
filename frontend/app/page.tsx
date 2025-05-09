'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Alert } from '@mui/material';
import StockChart from './components/StockChart';
import StockSelector from './components/StockSelector';
import { getAverageStockPrice, StockPrice } from './services/api';

export default function Home() {
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [timeInterval, setTimeInterval] = useState<number>(60);
  const [stockData, setStockData] = useState<{
    priceHistory: StockPrice[];
    averagePrice: number;
  }>({
    priceHistory: [],
    averagePrice: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stock data when ticker or time interval changes
  useEffect(() => {
    const fetchStockData = async () => {
      if (!selectedTicker) return;

      try {
        setLoading(true);
        setError(null);

        const data = await getAverageStockPrice(selectedTicker, timeInterval);

        setStockData({
          priceHistory: data.priceHistory,
          averagePrice: data.averageStockPrice,
        });
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [selectedTicker, timeInterval]);

  // Handle ticker change
  const handleTickerChange = (ticker: string) => {
    setSelectedTicker(ticker);
  };

  // Handle time interval change
  const handleTimeIntervalChange = (minutes: number) => {
    setTimeInterval(minutes);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Stock Price Chart
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <StockSelector
            selectedTicker={selectedTicker}
            onTickerChange={handleTickerChange}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <StockChart
          ticker={selectedTicker}
          priceHistory={stockData.priceHistory}
          averagePrice={stockData.averagePrice}
          onMinutesChange={handleTimeIntervalChange}
          loading={loading}
        />
      </Paper>

      <Typography variant="h6" gutterBottom>
        About This Chart
      </Typography>
      <Typography variant="body1" paragraph>
        This chart displays the price history of the selected stock over time. The red dashed line represents the average price over the selected time interval.
      </Typography>
      <Typography variant="body1" paragraph>
        You can hover over data points to see detailed information about each price update, including the exact time and the deviation from the average price.
      </Typography>
      <Typography variant="body1">
        Use the time range selector to view different time intervals and see how the average price changes.
      </Typography>
    </Container>
  );
}
