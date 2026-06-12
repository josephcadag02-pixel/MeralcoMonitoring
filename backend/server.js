import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = join(__dirname, '../data');
const CSV_FILE = join(DATA_DIR, 'readings.csv');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize CSV file if it doesn't exist
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, 'timestamp,reading,previousReading\n');
}

// Get all readings
app.get('/api/readings', (req, res) => {
  const readings = [];
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (row) => {
      readings.push({
        timestamp: row.timestamp,
        reading: parseFloat(row.reading),
        previousReading: parseFloat(row.previousReading)
      });
    })
    .on('end', () => {
      res.json(readings);
    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Error reading data' });
    });
});

// Add new reading
app.post('/api/readings', async (req, res) => {
  const { reading, previousReading, timestamp: providedTimestamp } = req.body;

  if (reading === undefined) {
    return res.status(400).json({ error: 'Missing required field: reading' });
  }

  // Use provided timestamp if valid, otherwise use now
  let timestamp;
  if (providedTimestamp) {
    try {
      timestamp = new Date(providedTimestamp).toISOString();
    } catch (e) {
      timestamp = new Date().toISOString();
    }
  } else {
    timestamp = new Date().toISOString();
  }
  const csvWriter = createObjectCsvWriter({
    path: CSV_FILE,
    header: [
      { id: 'timestamp', title: 'timestamp' },
      { id: 'reading', title: 'reading' },
      { id: 'previousReading', title: 'previousReading' }
    ],
    append: true
  });

  // Ensure numeric values for storage
  const numericReading = parseFloat(reading);
  const numericPrevious = previousReading === undefined || previousReading === null
    ? numericReading
    : parseFloat(previousReading);

  try {
    await csvWriter.writeRecords([{ timestamp, reading: numericReading, previousReading: numericPrevious }]);
    res.json({ success: true, timestamp, reading: numericReading, previousReading: numericPrevious });
  } catch (err) {
    console.error('Error writing to CSV:', err);
    res.status(500).json({ error: 'Error saving data' });
  }
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const readings = [];
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (row) => {
      readings.push({
        timestamp: new Date(row.timestamp),
        reading: parseFloat(row.reading),
        previousReading: parseFloat(row.previousReading)
      });
    })
    .on('end', () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);

      const dailyReadings = readings.filter(r => r.timestamp >= today);
      const monthlyReadings = readings.filter(r => r.timestamp >= monthStart);
      const yearlyReadings = readings.filter(r => r.timestamp >= yearStart);

      const calculateConsumption = (readingsList) => {
        if (readingsList.length < 2) return 0;
        const first = readingsList[0];
        const last = readingsList[readingsList.length - 1];
        return Math.max(0, last.reading - first.previousReading);
      };

      res.json({
        daily: calculateConsumption(dailyReadings),
        monthly: calculateConsumption(monthlyReadings),
        yearly: calculateConsumption(yearlyReadings),
        lastReading: readings.length > 0 ? readings[readings.length - 1] : null
      });
    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Error reading data' });
    });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route - simple status message for visiting the service in a browser
app.get('/', (req, res) => {
  res.send('Backend running');
});

// Export CSV for download
app.get('/api/export', (req, res) => {
  if (!fs.existsSync(CSV_FILE)) {
    return res.status(404).send('CSV file not found');
  }
  res.download(CSV_FILE, 'readings.csv', (err) => {
    if (err) {
      console.error('Error sending CSV:', err);
      if (!res.headersSent) res.status(500).send('Error sending file');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
