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
- `npm run start-mobile` - Start the mobile wrapper app

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
- Configure API endpoint in the frontend environment

### Desktop Application (Electron)
You can wrap this as an Electron app for Windows/Mac/Linux. The responsive design already works on all screen sizes.

### Mobile App (React Native)
The backend API can also be used with a React Native mobile app using the same API endpoints.

### Mobile Wrapper Setup
1. Navigate to the mobile folder:
```bash
cd mobile
npm install
npm start
```
2. Use the Expo app, Android emulator, or iOS simulator.
3. Set the backend base URL in the mobile app to your host:
   - Android emulator: `http://10.0.2.2:5000`
   - iOS simulator / macOS: `http://localhost:5000`
   - Real device: `http://<your-pc-ip>:5000`

### Generate an APK
Yes — you can generate an APK from the mobile wrapper using Expo Application Services (EAS).

1. Install EAS CLI:
```bash
cd mobile
npm install -g eas-cli
```
2. Login or register:
```bash
eas login
```
3. Build an Android APK:
```bash
cd mobile
eas build -p android --profile preview
```
4. Download the generated APK from the EAS build page or CLI output.

> If this project has a local `android/` folder from a previous `expo run:android` or `expo prebuild`, EAS managed builds can still succeed when the profile is forced to `managed` in `mobile/eas.json`.

If you prefer a local emulator/build flow, use:
```bash
cd mobile
npx expo run:android
```

#### Local Android build requirements
For local Android builds, your machine needs a compatible JDK version. Expo / Gradle for this project works best with Java 17:
- Install JDK 17 (Temurin 17, Amazon Corretto 17, or similar)
- Set `JAVA_HOME` to that JDK 17 installation
- Ensure `java -version` reports `17.x`

If you see an error like `Unsupported class file major version 68`, it means your JDK is too new. Install JDK 17 and point `JAVA_HOME` to it before running:
```bash
cd mobile
npx expo run:android
```

#### Run the APK build script
Once JDK 17 is configured, you can also run the wrapper script we added:
```bash
cd mobile
npm run build-apk
```

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
