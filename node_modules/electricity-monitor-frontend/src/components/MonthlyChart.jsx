import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function MonthlyChart({ readings }) {
  const data = useMemo(() => {
    const monthlyMap = {};

    readings.forEach(reading => {
      const date = new Date(reading.timestamp);
      const monthKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          consumption: 0,
          readings: 0
        };
      }

      monthlyMap[monthKey].consumption += reading.reading - reading.previousReading;
      monthlyMap[monthKey].readings += 1;
    });

    return Object.values(monthlyMap).slice(-12); // Last 12 months
  }, [readings]);

  if (data.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#999',
        fontSize: '1.1rem'
      }}>
        No data available for monthly chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="month"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis label={{ value: 'Usage (kWh)', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '2px solid #4ECDC4',
            borderRadius: '8px',
            padding: '10px'
          }}
          formatter={(value) => value.toFixed(2)}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="consumption"
          stroke="#4ECDC4"
          strokeWidth={3}
          dot={{ fill: '#4ECDC4', r: 5 }}
          activeDot={{ r: 7 }}
          name="Monthly Consumption (kWh)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
