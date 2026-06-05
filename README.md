# ⚡ Electricity Consumption Monitoring Application

A simple yet powerful application to monitor and track your electricity consumption with daily, monthly, and yearly statistics. Works on web browsers and mobile devices with responsive design.

## Features

✨ **Core Features:**
- 📊 Track current and previous meter readings
- 📈 Automatic calculation of daily, monthly, and yearly consumption
- 📅 Date and time tracking for each reading
- 💾 Data saved to CSV files for easy backup and analysis
- 📱 Fully responsive design for mobile and desktop
- 📥 Export readings as CSV

✨ **Visualizations:**
- 📊 Daily consumption bar chart (last 30 days)
- 📈 Monthly consumption line chart (last 12 months)
- 📋 Statistics cards showing current totals
- 📊 Recent readings table

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CSV Files** - Simple data storage
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Recharts** - Charting library
- **Axios** - HTTP client
- **CSS3** - Styling with gradients and animations

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm start
# Server starts on http://localhost:5000
```

**Available Scripts:**
- `npm install` - Install root and workspace dependencies
- `npm start` - Start backend server
- `npm run dev` - Start frontend dev server
- `npm run dev-all` - Start backend and frontend together

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App opens at http://localhost:3000
```

**Available Scripts:**
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Usage

### Adding Readings
1. Open the application in your browser
2. Fill in the **Current Meter Reading** and **Previous Meter Reading**
3. Click **Save Reading**
4. The consumption will be calculated automatically

### Viewing Statistics
- **Overview Tab**: Total readings and date range
- **Daily Tab**: Bar chart showing daily consumption (last 30 days)
- **Monthly Tab**: Line chart showing monthly consumption (last 12 months)

### Exporting Data
- Click the **Export CSV** button to download your readings

## Data Storage

All readings are stored in `data/readings.csv` with the following format:

```csv
timestamp,reading,previousReading
2024-01-15T10:30:00.000Z,1234.56,1200.00
2024-01-16T14:20:00.000Z,1268.90,1234.56
```

## API Reference

### GET /api/readings
Returns all saved readings.

**Response:**
```json
[
  {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "reading": 1234.56,
    "previousReading": 1200.00
  }
]
```

### POST /api/readings
Add a new reading.

**Request Body:**
```json
{
  "reading": 1234.56,
  "previousReading": 1200.00
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "reading": 1234.56,
  "previousReading": 1200.00
}
```

### GET /api/stats
Get consumption statistics.

**Response:**
```json
{
  "daily": 34.56,
  "monthly": 234.90,
  "yearly": 2345.67,
  "lastReading": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "reading": 1234.56,
    "previousReading": 1200.00
  }
}
```

## Mobile & Desktop Deployment

### Web Deployment
- Build frontend: `npm run build` in the frontend directory
- Deploy the `dist` folder to any static hosting (Netlify, Vercel, GitHub Pages)
- Set `VITE_API_URL` to your deployed backend URL, for example `https://meralcomonitoring.onrender.com`
- Make sure the frontend is built after setting the Netlify environment variable, because Vite embeds the value at build time.

### Desktop Application (Electron)
You can wrap this as an Electron app for Windows/Mac/Linux. The responsive design already works on all screen sizes.

## Responsive Design

The application is fully responsive and works seamlessly on:
- 📱 Mobile phones (iOS & Android)
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large displays

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
MeralcoMonitoring/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ReadingForm.jsx
│   │   │   ├── StatisticsCard.jsx
│   │   │   ├── DailyChart.jsx
│   │   │   └── MonthlyChart.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── data/
│   └── readings.csv
└── README.md
```

## Future Enhancements

- 🔐 User authentication
- ☁️ Cloud sync
- 📬 Email notifications for high usage
- 🎯 Consumption goals and alerts
- 📊 Advanced analytics and forecasting
- 🌙 Dark mode
- 🌍 Multi-language support

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or feature requests, please create an issue in the repository.

---

**Made with ❤️ for better electricity management**
