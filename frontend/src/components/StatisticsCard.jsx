import React from 'react';
import './StatisticsCard.css';

export default function StatisticsCard({ label, value, unit, color }) {
  return (
    <div className="stats-card" style={{ borderTopColor: color }}>
      <div className="stats-label">{label}</div>
      <div className="stats-value" style={{ color }}>
        {typeof value === 'number' ? value.toFixed(2) : value}
        <span className="stats-unit">{unit}</span>
      </div>
    </div>
  );
}
