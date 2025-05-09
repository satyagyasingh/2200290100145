'use client';

import { useState } from 'react';
import { Box, Container, Typography, Paper, Alert } from '@mui/material';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import { MultiStockSelector } from '../components/StockSelector';

export default function CorrelationPage() {
    const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
    const [timeInterval, setTimeInterval] = useState<number>(60);
    const [error, setError] = useState<string | null>(null);

    // Handle tickers change
    const handleTickersChange = (tickers: string[]) => {
        setSelectedTickers(tickers);
    };

    // Handle time interval change
    const handleTimeIntervalChange = (minutes: number) => {
        setTimeInterval(minutes);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Stock Correlation Heatmap
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <MultiStockSelector
                        selectedTickers={selectedTickers}
                        onTickersChange={handleTickersChange}
                        maxSelections={6}
                    />
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {selectedTickers.length > 0 ? (
                    <CorrelationHeatmap
                        tickers={selectedTickers}
                        minutes={timeInterval}
                        onMinutesChange={handleTimeIntervalChange}
                    />
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body1">
                            Please select at least one stock to view the correlation heatmap.
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Typography variant="h6" gutterBottom>
                About This Heatmap
            </Typography>
            <Typography variant="body1" paragraph>
                This heatmap visualizes the correlation between different stocks over the selected time interval. The colors represent the strength and direction of the correlation.
            </Typography>
            <Typography variant="body1" paragraph>
                Correlation values range from -1 to 1:
                <ul>
                    <li>Values close to 1 (green) indicate strong positive correlation – the stocks tend to move together in the same direction.</li>
                    <li>Values close to 0 (white/yellow) indicate little to no correlation – the stocks move independently of each other.</li>
                    <li>Values close to -1 (red) indicate strong negative correlation – the stocks tend to move in opposite directions.</li>
                </ul>
            </Typography>
            <Typography variant="body1">
                Hover over cells to see detailed statistics for each stock pair, including their average prices and standard deviations.
            </Typography>
        </Container>
    );
} 