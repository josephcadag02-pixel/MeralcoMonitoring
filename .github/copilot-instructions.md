<!-- Electricity Consumption Monitoring Application -->

This is a full-stack electricity consumption monitoring application with:
- **Backend**: Express.js API with CSV data storage
- **Frontend**: React + Vite with responsive design for web and mobile
- **Features**: Reading tracking, daily/monthly/yearly statistics, charts, CSV export

## Project Structure

```
MeralcoMonitoring/
├── backend/          # Express.js API server
├── frontend/         # React + Vite application
├── data/             # CSV data storage
└── .github/          # Configuration files
```

## Getting Started

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Start server: `npm start` (production) or `npm run dev` (development)
4. Server runs on http://localhost:5000

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open http://localhost:3000 in your browser

### Data Storage
- All readings are automatically saved to `data/readings.csv`
- CSV format: `timestamp,reading,previousReading`
- Export option available from the UI

## API Endpoints
- `GET /api/readings` - Get all readings
- `POST /api/readings` - Add new reading
- `GET /api/stats` - Get daily/monthly/yearly statistics
- `GET /api/health` - Health check
