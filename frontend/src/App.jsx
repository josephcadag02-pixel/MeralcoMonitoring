import React, { useState, useEffect } from 'react';
import { api } from './api';
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
  const [ratePerKwh, setRatePerKwh] = useState(13.0);
  const [currency, setCurrency] = useState('PHP');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Manila');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [monthlySummaries, setMonthlySummaries] = useState([]);
  const [last30DaysCost, setLast30DaysCost] = useState(0);
  const [monthCutoffDay, setMonthCutoffDay] = useState(28);
  const [monthlyCycleKwh, setMonthlyCycleKwh] = useState(0);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const getBillingCycleStart = (cutoffDay) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysThisMonth = getDaysInMonth(year, month);
    const effectiveCutoff = Math.min(cutoffDay, daysThisMonth);

    if (now.getDate() >= effectiveCutoff) {
      return new Date(year, month, effectiveCutoff, 0, 0, 0, 0);
    }

    const prev = new Date(year, month, 0);
    const prevYear = prev.getFullYear();
    const prevMonth = prev.getMonth();
    const prevDays = getDaysInMonth(prevYear, prevMonth);
    const prevCutoff = Math.min(cutoffDay, prevDays);
    return new Date(prevYear, prevMonth, prevCutoff, 0, 0, 0, 0);
  };

  const calculateMonthlyCycleUsage = (readingsList, cutoffDay) => {
    if (!readingsList?.length) return 0;
    const cycleStart = getBillingCycleStart(cutoffDay);
    return readingsList.reduce((acc, r) => {
      const timestamp = new Date(r.timestamp);
      if (timestamp >= cycleStart) {
        return acc + ((r.reading - r.previousReading) || 0);
      }
      return acc;
    }, 0);
  };

  useEffect(() => {
    const storedRateValue = localStorage.getItem('meralcoRate');
    const storedCurrency = localStorage.getItem('currency');
    const storedTimezone = localStorage.getItem('timezone');
    const storedCutoff = localStorage.getItem('monthCutoffDay');

    if (storedRateValue !== null) {
      const storedRate = parseFloat(storedRateValue);
      if (!Number.isNaN(storedRate)) {
        setRatePerKwh(storedRate);
      }
    }
    if (storedCurrency) {
      setCurrency(storedCurrency);
    }
    if (storedTimezone) {
      setTimezone(storedTimezone);
    }
    if (storedCutoff) {
      const cutoffValue = parseInt(storedCutoff, 10);
      if (!Number.isNaN(cutoffValue) && cutoffValue >= 1 && cutoffValue <= 31) {
        setMonthCutoffDay(cutoffValue);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    setMonthlyCycleKwh(calculateMonthlyCycleUsage(readings, monthCutoffDay));
  }, [readings, monthCutoffDay]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [readingsRes, statsRes] = await Promise.all([
        api.get('/api/readings'),
        api.get('/api/stats')
      ]);
      const fetchedReadings = readingsRes.data;
      setReadings(fetchedReadings);
      setStats(statsRes.data);

      // compute monthly summaries (total kWh per month)
      const monthlyMap = {};
      fetchedReadings.forEach(r => {
        const d = new Date(r.timestamp);
        const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const usage = (r.reading - r.previousReading) || 0;
        if (!monthlyMap[key]) monthlyMap[key] = 0;
        monthlyMap[key] += usage;
      });
      const summaries = Object.keys(monthlyMap).map(k => ({ month: k, total: monthlyMap[k] }));
      setMonthlySummaries(summaries.slice(-24));

      // compute last 30 days consumption and cost
      const now = new Date();
      const days30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      const last30Consumption = fetchedReadings.reduce((acc, r) => {
        const d = new Date(r.timestamp);
        if (d >= days30) return acc + ((r.reading - r.previousReading) || 0);
        return acc;
      }, 0);
      setLast30DaysCost(last30Consumption * ratePerKwh);
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

  const formatTimestamp = (timestamp) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(timestamp));
    } catch (error) {
      return new Date(timestamp).toLocaleString();
    }
  };

  const saveSettings = () => {
    localStorage.setItem('meralcoRate', ratePerKwh.toString());
    localStorage.setItem('currency', currency);
    localStorage.setItem('timezone', timezone);
    localStorage.setItem('monthCutoffDay', monthCutoffDay.toString());
    setSettingsMessage('Settings saved');
    window.setTimeout(() => setSettingsMessage(''), 2500);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content" style={{ textAlign: 'center', marginLeft: '200px' }}>
          <h1>⚡ Electricity Consumption Monitor</h1>
          <p>Track your daily, monthly, and yearly consumption</p>
        </div>
        <div className="header-actions">
          <button
            className={`settings-icon-button ${settingsOpen ? 'active' : ''}`}
            onClick={() => setSettingsOpen(prev => !prev)}
            aria-label="Toggle settings"
          >
            ⚙
          </button>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Input Section */}
          <ReadingForm onReadingAdded={handleNewReading} />

          {settingsOpen && (
            <div className="settings-panel">
              <h2>Settings</h2>
              <div className="settings-grid">
                <label className="settings-field">
                  Rate per kWh
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ratePerKwh}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!Number.isNaN(value)) {
                        setRatePerKwh(value);
                      }
                    }}
                  />
                </label>
                <label className="settings-field">
                  Currency
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="PHP">PHP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="JPY">JPY</option>
                  </select>
                </label>
                <label className="settings-field">
                  Timezone
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    <option value="Asia/Manila">Asia/Manila</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </label>
                <label className="settings-field">
                  Billing cycle reset day
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={monthCutoffDay}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!Number.isNaN(value) && value >= 1 && value <= 31) {
                        setMonthCutoffDay(value);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="settings-actions">
                <button className="settings-save-button" onClick={saveSettings}>Save Settings</button>
                {settingsMessage && <span className="settings-message">{settingsMessage}</span>}
              </div>
            </div>
          )}

          {/* Stats Section */}
          {stats && (
            <>
              <div className="stats-grid">
                <StatisticsCard
                  label={`Billing Cycle Cost (${currency})`}
                  value={monthlyCycleKwh * ratePerKwh}
                  unit={` ${currency}`}
                  color="#FF6B6B"
                />
                <StatisticsCard
                  label={`Last 30 Days Cost (${currency})`}
                  value={last30DaysCost}
                  unit={` ${currency}`}
                  color="#FF884D"
                />
                <StatisticsCard
                  label="Current Billing Cycle"
                  value={monthlyCycleKwh}
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
            </>
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
                  <h3>Total kWh History (Monthly Summaries)</h3>
                  <div style={{ overflowX: 'auto', marginTop: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Month</th>
                          <th style={{ textAlign: 'right', padding: '8px' }}>Total kWh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlySummaries.length === 0 && (
                          <tr>
                            <td colSpan={2} style={{ padding: '8px', color: '#999' }}>No monthly data available</td>
                          </tr>
                        )}
                        {monthlySummaries.map((m, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px' }}>{m.month}</td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>{m.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                      <td>{formatTimestamp(reading.timestamp)}</td>
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
