'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    useTheme,
    Tooltip,
    Grid,
    Paper,
} from '@mui/material';
import { getCorrelationMatrix, getAverageStockPrice, StockPrice } from '../services/api';

interface CorrelationHeatmapProps {
    tickers: string[];
    minutes?: number;
    onMinutesChange?: (minutes: number) => void;
}

const TIME_INTERVALS = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
];

interface StockStats {
    average: number;
    stdDev: number;
    priceHistory: StockPrice[];
}

const CorrelationHeatmap = ({
    tickers,
    minutes = 60,
    onMinutesChange,
}: CorrelationHeatmapProps) => {
    const theme = useTheme();
    const [timeInterval, setTimeInterval] = useState<number>(minutes);
    const [correlationData, setCorrelationData] = useState<{ [pair: string]: number }>({});
    const [stockStats, setStockStats] = useState<{ [ticker: string]: StockStats }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [hoveredStock, setHoveredStock] = useState<string | null>(null);

    // Calculate standard deviation
    const calculateStdDev = (priceHistory: StockPrice[], average: number): number => {
        if (!priceHistory || priceHistory.length <= 1) return 0;

        const squaredDiffs = priceHistory.map(item =>
            Math.pow(item.price - average, 2)
        );

        const sum = squaredDiffs.reduce((acc, val) => acc + val, 0);
        return Math.sqrt(sum / (priceHistory.length - 1));
    };

    // Load correlation data
    const loadCorrelationData = async () => {
        setLoading(true);
        try {
            // Load correlation matrix
            const matrix = await getCorrelationMatrix(tickers, timeInterval);
            setCorrelationData(matrix);

            // Load statistics for each stock
            const statsPromises = tickers.map(async (ticker) => {
                try {
                    const data = await getAverageStockPrice(ticker, timeInterval);
                    return {
                        ticker,
                        average: data.averageStockPrice,
                        stdDev: calculateStdDev(data.priceHistory, data.averageStockPrice),
                        priceHistory: data.priceHistory,
                    };
                } catch (error) {
                    console.error(`Error fetching stats for ${ticker}:`, error);
                    return {
                        ticker,
                        average: 0,
                        stdDev: 0,
                        priceHistory: [],
                    };
                }
            });

            const stockStatsArray = await Promise.all(statsPromises);

            const statsMap: { [ticker: string]: StockStats } = {};
            stockStatsArray.forEach(stat => {
                statsMap[stat.ticker] = {
                    average: stat.average,
                    stdDev: stat.stdDev,
                    priceHistory: stat.priceHistory,
                };
            });

            setStockStats(statsMap);
        } catch (error) {
            console.error('Error loading correlation data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle time interval change
    const handleTimeIntervalChange = (event: SelectChangeEvent<number>) => {
        const newValue = event.target.value as number;
        setTimeInterval(newValue);
        if (onMinutesChange) {
            onMinutesChange(newValue);
        }
    };

    // Load data when component mounts or time interval changes
    useEffect(() => {
        loadCorrelationData();
    }, [timeInterval]);

    // Get color based on correlation value
    const getCorrelationColor = (value: number) => {
        if (isNaN(value) || value === null) return theme.palette.grey[300];

        // Strong positive correlation (dark green)
        if (value >= 0.7) return '#1a9850';
        // Moderate positive correlation (light green)
        if (value >= 0.3) return '#91cf60';
        // Weak positive correlation (very light green)
        if (value >= 0.1) return '#d9ef8b';
        // No correlation (white/light gray)
        if (value > -0.1) return '#ffffbf';
        // Weak negative correlation (light pink)
        if (value > -0.3) return '#fee08b';
        // Moderate negative correlation (orange)
        if (value > -0.7) return '#fc8d59';
        // Strong negative correlation (dark red)
        return '#d73027';
    };

    // Get correlation between two tickers
    const getCorrelation = (ticker1: string, ticker2: string): number => {
        if (ticker1 === ticker2) return 1; // Perfect correlation with self

        const key1 = `${ticker1}_${ticker2}`;
        const key2 = `${ticker2}_${ticker1}`;

        return correlationData[key1] || correlationData[key2] || 0;
    };

    // Render color legend
    const renderColorLegend = () => {
        const legendItems = [
            { value: 1, label: 'Strong +ve (+0.7 to +1.0)' },
            { value: 0.5, label: 'Moderate +ve (+0.3 to +0.7)' },
            { value: 0.2, label: 'Weak +ve (+0.1 to +0.3)' },
            { value: 0, label: 'No correlation (-0.1 to +0.1)' },
            { value: -0.2, label: 'Weak -ve (-0.1 to -0.3)' },
            { value: -0.5, label: 'Moderate -ve (-0.3 to -0.7)' },
            { value: -0.8, label: 'Strong -ve (-0.7 to -1.0)' },
        ];

        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mt: 2,
                    p: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Correlation Legend
                </Typography>
                {legendItems.map((item) => (
                    <Box key={item.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 20,
                                height: 20,
                                backgroundColor: getCorrelationColor(item.value),
                                border: `1px solid ${theme.palette.divider}`,
                            }}
                        />
                        <Typography variant="body2">{item.label}</Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <Card sx={{ width: '100%', height: '100%', minHeight: 500 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="div">
                        Stock Correlation Heatmap
                    </Typography>
                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel id="time-interval-label">Time Range</InputLabel>
                        <Select
                            labelId="time-interval-label"
                            id="time-interval-select"
                            value={timeInterval}
                            label="Time Range"
                            onChange={handleTimeIntervalChange}
                        >
                            {TIME_INTERVALS.map((interval) => (
                                <MenuItem key={interval.value} value={interval.value}>
                                    {interval.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={9}>
                            <Box sx={{ overflowX: 'auto' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 600 }}>
                                    {/* Column Headers */}
                                    <Box sx={{ display: 'flex', ml: 6 }}>
                                        {tickers.map((ticker) => (
                                            <Box
                                                key={ticker}
                                                sx={{
                                                    width: 60,
                                                    p: 1,
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    bgcolor: hoveredStock === ticker ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                                                }}
                                                onMouseEnter={() => setHoveredStock(ticker)}
                                                onMouseLeave={() => setHoveredStock(null)}
                                            >
                                                {ticker}
                                            </Box>
                                        ))}
                                    </Box>

                                    {/* Rows */}
                                    {tickers.map((rowTicker) => (
                                        <Box
                                            key={rowTicker}
                                            sx={{
                                                display: 'flex',
                                                borderTop: `1px solid ${theme.palette.divider}`,
                                                '&:last-child': { borderBottom: `1px solid ${theme.palette.divider}` },
                                                bgcolor: hoveredStock === rowTicker ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                                            }}
                                        >
                                            {/* Row Header */}
                                            <Box
                                                sx={{
                                                    width: 60,
                                                    p: 1,
                                                    fontWeight: 'bold',
                                                    textAlign: 'right',
                                                    position: 'sticky',
                                                    left: 0,
                                                    backgroundColor: theme.palette.background.paper,
                                                    boxShadow: 1,
                                                    zIndex: 1,
                                                }}
                                                onMouseEnter={() => setHoveredStock(rowTicker)}
                                                onMouseLeave={() => setHoveredStock(null)}
                                            >
                                                {rowTicker}
                                            </Box>

                                            {/* Cells */}
                                            {tickers.map((colTicker) => {
                                                const correlation = getCorrelation(rowTicker, colTicker);
                                                return (
                                                    <Tooltip
                                                        key={`${rowTicker}-${colTicker}`}
                                                        title={
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    <strong>Correlation:</strong> {correlation.toFixed(4)}
                                                                </Typography>
                                                                {rowTicker !== colTicker && (
                                                                    <>
                                                                        <Typography variant="body2">
                                                                            <strong>{rowTicker} Avg:</strong> ${stockStats[rowTicker]?.average.toFixed(2) || 'N/A'}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>{rowTicker} StdDev:</strong> ${stockStats[rowTicker]?.stdDev.toFixed(2) || 'N/A'}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>{colTicker} Avg:</strong> ${stockStats[colTicker]?.average.toFixed(2) || 'N/A'}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            <strong>{colTicker} StdDev:</strong> ${stockStats[colTicker]?.stdDev.toFixed(2) || 'N/A'}
                                                                        </Typography>
                                                                    </>
                                                                )}
                                                            </Box>
                                                        }
                                                        arrow
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 60,
                                                                height: 60,
                                                                backgroundColor: getCorrelationColor(correlation),
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                borderRight: `1px solid ${theme.palette.divider}`,
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    outline: `2px solid ${theme.palette.primary.main}`,
                                                                    zIndex: 2,
                                                                },
                                                            }}
                                                        >
                                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                                {rowTicker === colTicker ? '1.00' : correlation.toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                );
                                            })}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            {renderColorLegend()}

                            {hoveredStock && stockStats[hoveredStock] && (
                                <Paper sx={{ mt: 2, p: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {hoveredStock} Stats
                                    </Typography>
                                    <Typography variant="body2">
                                        Average Price: ${stockStats[hoveredStock].average.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2">
                                        Standard Deviation: ${stockStats[hoveredStock].stdDev.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2">
                                        Data Points: {stockStats[hoveredStock].priceHistory.length}
                                    </Typography>
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default CorrelationHeatmap; 