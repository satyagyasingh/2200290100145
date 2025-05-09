# 2200290100145

## Stock Price Aggregation Full Stack Application

This repository contains a full stack application for stock price aggregation and correlation analysis.

### Project Structure

- `/api` - Backend API built with Express.js
- `/frontend` - Frontend application built with Next.js and Material UI

### Features

#### Backend API
- Stock data fetching with caching to minimize external API calls
- Average stock price calculation
- Correlation analysis between stocks
- RESTful API endpoints

#### Frontend Application
- Stock Price Chart with average price visualization
- Correlation Heatmap with detailed statistics
- Responsive design for both mobile and desktop views
- Material UI components for a modern interface

### Tech Stack

- **Backend**:
  - Node.js
  - Express.js
  - Axios for API requests
  - Node-Cache for efficient caching

- **Frontend**:
  - Next.js with TypeScript
  - Material UI
  - Recharts for data visualization
  - Axios for API requests

### Running the Application

#### Backend API

```bash
cd api
npm install
npm start
```

The API will run on http://localhost:4000

#### Frontend Application

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:3000

### API Endpoints

- `GET /stocks` - Get all available stocks
- `GET /stocks/:ticker?minutes=m&aggregation=average` - Get average stock price for a specific ticker
- `GET /stockcorrelation?minutes=m&ticker={ticker1}&ticker={ticker2}` - Get correlation between two stocks
