import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './ReadingForm.css';

export default function ReadingForm({ onReadingAdded }) {
  const [reading, setReading] = useState('');
  const [previousReading, setPreviousReading] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // initialize timestamp for datetime-local input
    const now = new Date();
    const local = now.toISOString().slice(0,16);
    setTimestamp(local);

    // fetch last reading to populate previousReading
    const loadLast = async () => {
      try {
        const res = await api.get('/api/stats');
        const last = res && res.data && res.data.lastReading;
        if (last && last.reading !== undefined && last.reading !== null) {
          setPreviousReading(last.reading.toString());
        }
      } catch (err) {
        // ignore; leave previousReading blank
      }
    };

    loadLast();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reading) {
      setMessage('Please fill in the current reading');
      return;
    }

    try {
      setLoading(true);
      // Convert datetime-local (local) to ISO string
      const isoTimestamp = timestamp ? new Date(timestamp).toISOString() : undefined;

      await api.post('/api/readings', {
        reading: parseFloat(reading),
        previousReading: previousReading ? parseFloat(previousReading) : undefined,
        timestamp: isoTimestamp
      });

      setMessage('✓ Reading saved successfully!');
        setReading('');
        // after saving, previousReading will be refreshed by parent fetch
      
      setTimeout(() => setMessage(''), 3000);
      onReadingAdded();
      // refresh previous reading locally
      try {
        const res2 = await api.get('/api/stats');
        const last2 = res2 && res2.data && res2.data.lastReading;
        if (last2 && last2.reading !== undefined && last2.reading !== null) {
          setPreviousReading(last2.reading.toString());
        }
      } catch (err) {
        // ignore
      }
    } catch (error) {
      setMessage('Error saving reading. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Reading</h2>
      <form onSubmit={handleSubmit} className="reading-form">
        <div className="form-group">
          <label htmlFor="current">Current Meter Reading (kWh)</label>
          <input
            id="current"
            type="number"
            step="0.01"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            placeholder="e.g., 1234.56"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="previous">Previous Meter Reading (kWh)</label>
          <input
            id="previous"
            type="number"
            step="0.01"
            value={previousReading}
            placeholder="Auto-filled from last entry"
            disabled={true}
          />
        </div>
          <div className="form-group">
            <label htmlFor="timestamp">Date & Time</label>
            <input
            id="timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            disabled={loading}
            />
          </div>

        {reading && previousReading && (
          <div className="consumption-preview">
            <p>Consumption: <strong>{(parseFloat(reading) - parseFloat(previousReading)).toFixed(2)} kWh</strong></p>
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Saving...' : '📝 Save Reading'}
        </button>

        {message && (
          <div className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
