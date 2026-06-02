import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function DailyChart({ readings }) {
  const data = useMemo(() => {
    const dailyMap = {};

    readings.forEach(reading => {
      const date = new Date(reading.timestamp);
      const dayKey = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = {
          day: dayKey,
          consumption: 0,
          readings: 0
        };
      }

      if (dailyMap[dayKey].readings > 0) {
        dailyMap[dayKey].consumption += reading.reading - reading.previousReading;
      }
      dailyMap[dayKey].readings += 1;
    });

    return Object.values(dailyMap).slice(-30); // Last 30 days
  }, [readings]);

  if (data.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#999',
        fontSize: '1.1rem'
      }}>
        No data available for daily chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="day"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis label={{ value: 'Usage (kWh)', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '2px solid #667eea',
            borderRadius: '8px',
            padding: '10px'
          }}
          formatter={(value) => value.toFixed(2)}
        />
        <Legend />
        <Bar
          dataKey="consumption"
          fill="#667eea"
          radius={[8, 8, 0, 0]}
          name="Daily Consumption (kWh)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
