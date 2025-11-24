import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { BodeDataPoint } from '../types';

interface PhaseChartProps {
  data: BodeDataPoint[];
}

export const PhaseChart: React.FC<PhaseChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 ml-2">Phase Response ∠H(jω)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 25, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="frequency"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => value.toString()}
            label={{ value: 'Frequency (rad/s)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 12 }}
            stroke="#94a3b8"
            tick={{fontSize: 12}}
            allowDataOverflow
          />
          <YAxis
            label={{ value: 'Phase (deg)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 12 }}
            stroke="#94a3b8"
            tick={{fontSize: 12}}
            domain={[-180, 180]}
            allowDataOverflow={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#64748b', marginBottom: '0.25rem', fontSize: '0.75rem' }}
            itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}
            labelFormatter={(label) => `Frequency: ${Number(label).toFixed(2)} rad/s`}
            formatter={(value: number) => [value.toFixed(2) + '°', 'Phase']}
          />
          <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
          <ReferenceLine x={0} stroke="#cbd5e1" strokeDasharray="3 3" />
          <ReferenceLine y={-180} stroke="#cbd5e1" strokeDasharray="3 3" />
          <ReferenceLine y={180} stroke="#cbd5e1" strokeDasharray="3 3" />
          
          <Line
            type="monotone"
            dataKey="phase"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#8b5cf6' }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
