'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
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
} from '@mui/material';
import { StockPrice } from '../services/api';

interface StockChartProps {
    ticker: string;
    priceHistory: StockPrice[];
    averagePrice: number;
    onMinutesChange?: (minutes: number) => void;
    loading?: boolean;
}

const TIME_INTERVALS = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
];

const StockChart = ({
    ticker,
    priceHistory,
    averagePrice,
    onMinutesChange,
    loading = false,
}: StockChartProps) => {
    const [timeInterval, setTimeInterval] = useState<number>(60);

    // Format data for Recharts
    const chartData = priceHistory.map((item) => ({
        time: format(parseISO(item.lastUpdatedAt), 'HH:mm:ss'),
        price: item.price,
        timestamp: item.lastUpdatedAt,
        formattedDate: format(parseISO(item.lastUpdatedAt), 'yyyy-MM-dd HH:mm:ss'),
    }));

    // Handle time interval change
    const handleTimeIntervalChange = (event: SelectChangeEvent<number>) => {
        const newValue = event.target.value as number;
        setTimeInterval(newValue);
        if (onMinutesChange) {
            onMinutesChange(newValue);
        }
    };

    // Set initial time interval
    useEffect(() => {
        if (onMinutesChange) {
            onMinutesChange(timeInterval);
        }
    }, []);

    // Custom tooltip content
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Card sx={{ p: 1, boxShadow: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {payload[0].payload.formattedDate}
                    </Typography>
                    <Typography color="primary">
                        Price: ${payload[0].value.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        Difference from average: ${(payload[0].value - averagePrice).toFixed(2)}
                    </Typography>
                </Card>
            );
        }
        return null;
    };

    return (
        <Card sx={{ width: '100%', height: '100%', minHeight: 400 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="div">
                        {ticker} Stock Price
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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">
                        Average Price: <strong>${averagePrice.toFixed(2)}</strong>
                    </Typography>
                    <Typography variant="body2">
                        Data points: {priceHistory.length}
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <LineChart
                                data={chartData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="time"
                                    label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                                />
                                <YAxis
                                    label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <ReferenceLine
                                    y={averagePrice}
                                    label="Average"
                                    stroke="red"
                                    strokeDasharray="3 3"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#8884d8"
                                    activeDot={{ r: 8 }}
                                    name="Stock Price"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default StockChart; 