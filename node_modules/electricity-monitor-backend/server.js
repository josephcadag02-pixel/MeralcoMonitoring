import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Reading from './models/Reading.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = join(__dirname, '../data');
const CSV_FILE = join(DATA_DIR, 'readings.csv');
const MONGODB_URI = process.env.MONGODB_URI;

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

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Get all readings
app.get('/api/readings', async (req, res) => {
  if (isMongoConnected()) {
    try {
      const readings = await Reading.find({}).sort({ timestamp: 1 }).lean();
      return res.json(readings.map(r => ({
        timestamp: r.timestamp.toISOString(),
        reading: r.reading,
        previousReading: r.previousReading
      })));
    } catch (err) {
      console.error('Error reading from MongoDB:', err);
      return res.status(500).json({ error: 'Error reading data' });
    }
  }

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

  const numericReading = parseFloat(reading);
  const numericPrevious = previousReading === undefined || previousReading === null
    ? numericReading
    : parseFloat(previousReading);

  if (isMongoConnected()) {
    try {
      const newReading = await Reading.create({
        timestamp: new Date(timestamp),
        reading: numericReading,
        previousReading: numericPrevious
      });
      return res.json({
        success: true,
        timestamp: newReading.timestamp.toISOString(),
        reading: newReading.reading,
        previousReading: newReading.previousReading
      });
    } catch (err) {
      console.error('Error writing to MongoDB:', err);
      return res.status(500).json({ error: 'Error saving data' });
    }
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

  try {
    await csvWriter.writeRecords([{ timestamp, reading: numericReading, previousReading: numericPrevious }]);
    res.json({ success: true, timestamp, reading: numericReading, previousReading: numericPrevious });
  } catch (err) {
    console.error('Error writing to CSV:', err);
    res.status(500).json({ error: 'Error saving data' });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  if (isMongoConnected()) {
    try {
      const allReadings = await Reading.find({}).sort({ timestamp: 1 }).lean();
      const readings = allReadings.map(r => ({
        timestamp: new Date(r.timestamp),
        reading: r.reading,
        previousReading: r.previousReading
      }));

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

      return res.json({
        daily: calculateConsumption(dailyReadings),
        monthly: calculateConsumption(monthlyReadings),
        yearly: calculateConsumption(yearlyReadings),
        lastReading: readings.length > 0 ? readings[readings.length - 1] : null
      });
    } catch (err) {
      console.error('Error reading stats from MongoDB:', err);
      return res.status(500).json({ error: 'Error reading data' });
    }
  }

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

const connectDatabase = async () => {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set. Falling back to CSV storage.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
