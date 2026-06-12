import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Reading from './models/Reading.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MONGODB_URI = process.env.MONGODB_URI;
const CSV_FILE = join(__dirname, '../data/readings.csv');

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

const readCsv = () => new Promise((resolve, reject) => {
  const rows = [];
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (row) => {
      rows.push({
        timestamp: new Date(row.timestamp),
        reading: parseFloat(row.reading),
        previousReading: parseFloat(row.previousReading)
      });
    })
    .on('end', () => resolve(rows))
    .on('error', reject);
});

const migrate = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const rows = await readCsv();
    if (rows.length === 0) {
      console.log('No rows found in CSV. Nothing to migrate.');
      process.exit(0);
    }

    const inserted = await Reading.insertMany(rows);
    console.log(`Imported ${inserted.length} readings into MongoDB.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
