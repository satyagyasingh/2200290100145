'use client';

import { useState, useEffect } from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Chip,
    OutlinedInput,
    SelectChangeEvent,
    Typography,
    CircularProgress,
} from '@mui/material';
import { getAllStocks } from '../services/api';

interface StockSelectorProps {
    selectedTicker: string;
    onTickerChange: (ticker: string) => void;
}

export default function StockSelector({
    selectedTicker,
    onTickerChange,
}: StockSelectorProps) {
    const [stocks, setStocks] = useState<{ [name: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                setLoading(true);
                const response = await getAllStocks();
                setStocks(response.stocks);

                // Set default selection if no ticker is selected yet
                if (!selectedTicker && Object.values(response.stocks).length > 0) {
                    onTickerChange(Object.values(response.stocks)[0]);
                }
            } catch (err) {
                console.error('Error fetching stocks:', err);
                setError('Failed to load stocks. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, []);

    const handleChange = (event: SelectChangeEvent<string>) => {
        onTickerChange(event.target.value as string);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2">Loading stocks...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" variant="body2">
                {error}
            </Typography>
        );
    }

    return (
        <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="stock-select-label">Select Stock</InputLabel>
            <Select
                labelId="stock-select-label"
                id="stock-select"
                value={selectedTicker}
                onChange={handleChange}
                label="Select Stock"
            >
                {Object.entries(stocks).map(([name, ticker]) => (
                    <MenuItem key={ticker} value={ticker}>
                        {name} ({ticker})
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

interface MultiStockSelectorProps {
    selectedTickers: string[];
    onTickersChange: (tickers: string[]) => void;
    maxSelections?: number;
}

export function MultiStockSelector({
    selectedTickers,
    onTickersChange,
    maxSelections = 6,
}: MultiStockSelectorProps) {
    const [stocks, setStocks] = useState<{ [name: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                setLoading(true);
                const response = await getAllStocks();
                setStocks(response.stocks);

                // Set default selections if none are selected yet
                if (selectedTickers.length === 0) {
                    const defaultTickers = Object.values(response.stocks).slice(0, maxSelections);
                    onTickersChange(defaultTickers);
                }
            } catch (err) {
                console.error('Error fetching stocks:', err);
                setError('Failed to load stocks. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, []);

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        // On autofill we get a stringified value.
        const tickers = typeof value === 'string' ? value.split(',') : value;

        // Limit the number of selections
        const limitedTickers = tickers.slice(0, maxSelections);
        onTickersChange(limitedTickers);
    };

    // Get stock name from ticker
    const getStockName = (ticker: string): string => {
        const entry = Object.entries(stocks).find(([_, t]) => t === ticker);
        return entry ? entry[0] : ticker;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2">Loading stocks...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" variant="body2">
                {error}
            </Typography>
        );
    }

    return (
        <FormControl sx={{ width: '100%' }}>
            <InputLabel id="multi-stock-select-label">Select Stocks</InputLabel>
            <Select
                labelId="multi-stock-select-label"
                id="multi-stock-select"
                multiple
                value={selectedTickers}
                onChange={handleChange}
                input={<OutlinedInput label="Select Stocks" />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((ticker) => (
                            <Chip key={ticker} label={ticker} />
                        ))}
                    </Box>
                )}
            >
                {Object.entries(stocks).map(([name, ticker]) => (
                    <MenuItem
                        key={ticker}
                        value={ticker}
                        disabled={selectedTickers.length >= maxSelections && !selectedTickers.includes(ticker)}
                    >
                        {name} ({ticker})
                    </MenuItem>
                ))}
            </Select>
            <Typography variant="caption" sx={{ mt: 1 }}>
                {selectedTickers.length} of {maxSelections} stocks selected
            </Typography>
        </FormControl>
    );
} 