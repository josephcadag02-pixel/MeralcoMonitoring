import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReadingForm from './components/ReadingForm';
import StatisticsCard from './components/StatisticsCard';
import DailyChart from './components/DailyChart';
import MonthlyChart from './components/MonthlyChart';
import './App.css';

export default function App() {
  const [readings, setReadings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [readingsRes, statsRes] = await Promise.all([
        axios.get('/api/readings'),
        axios.get('/api/stats')
      ]);
      setReadings(readingsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewReading = async () => {
    fetchData();
  };

  const exportCSV = () => {
    const csv = 'timestamp,reading,previousReading\n' +
      readings.map(r => `${r.timestamp},${r.reading},${r.previousReading}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electricity-readings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>⚡ Electricity Consumption Monitor</h1>
          <p>Track your daily, monthly, and yearly consumption</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Input Section */}
          <ReadingForm onReadingAdded={handleNewReading} />

          {/* Stats Section */}
          {stats && (
            <div className="stats-grid">
              <StatisticsCard
                label="Today's Usage"
                value={stats.daily}
                unit="kWh"
                color="#FF6B6B"
              />
              <StatisticsCard
                label="This Month"
                value={stats.monthly}
                unit="kWh"
                color="#4ECDC4"
              />
              <StatisticsCard
                label="This Year"
                value={stats.yearly}
                unit="kWh"
                color="#45B7D1"
              />
              {stats.lastReading && (
                <StatisticsCard
                  label="Current Reading"
                  value={stats.lastReading.reading}
                  unit="kWh"
                  color="#FFA502"
                />
              )}
            </div>
          )}

          {/* Charts Section */}
          <div className="charts-section">
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
                onClick={() => setActiveTab('daily')}
              >
                Daily
              </button>
              <button
                className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                onClick={() => setActiveTab('monthly')}
              >
                Monthly
              </button>
              <button
                className="export-btn"
                onClick={exportCSV}
              >
                📥 Export CSV
              </button>
            </div>

            <div className="chart-container">
              {activeTab === 'overview' && (
                <div className="overview-info">
                  <p>Total readings recorded: <strong>{readings.length}</strong></p>
                  {readings.length > 0 && (
                    <>
                      <p>First reading: <strong>{new Date(readings[0].timestamp).toLocaleDateString()}</strong></p>
                      <p>Latest reading: <strong>{new Date(readings[readings.length - 1].timestamp).toLocaleDateString()}</strong></p>
                    </>
                  )}
                </div>
              )}
              {activeTab === 'daily' && <DailyChart readings={readings} />}
              {activeTab === 'monthly' && <MonthlyChart readings={readings} />}
            </div>
          </div>

          {/* Readings Table */}
          {readings.length > 0 && (
            <div className="readings-table">
              <h3>Recent Readings</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Current Reading (kWh)</th>
                    <th>Previous Reading (kWh)</th>
                    <th>Usage (kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.slice().reverse().slice(0, 10).map((reading, idx) => (
                    <tr key={idx}>
                      <td>{new Date(reading.timestamp).toLocaleString()}</td>
                      <td className="value">{reading.reading.toFixed(2)}</td>
                      <td className="value">{reading.previousReading.toFixed(2)}</td>
                      <td className="value usage">{(reading.reading - reading.previousReading).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
