import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { ComplexNumber } from '../types';

interface PoleZeroMapProps {
  poles: ComplexNumber[];
  zeros: ComplexNumber[];
  selectedId: string | null;
}

// Group points by location to handle multiplicity
const groupPoints = (points: ComplexNumber[], type: 'pole' | 'zero', selectedId: string | null) => {
  const groups: Record<string, any> = {};

  points.forEach(p => {
    // Key based on coordinates with fixed precision
    const key = `${p.real.toFixed(4)}_${p.imag.toFixed(4)}`;
    
    if (!groups[key]) {
      groups[key] = {
        real: p.real,
        imag: p.imag,
        type,
        count: 0,
        selected: false,
      };
    }
    
    groups[key].count += 1;
    // If any point in this group is selected, mark group as selected
    if (p.id === selectedId) {
      groups[key].selected = true;
    }
  });

  return Object.values(groups);
};

const CustomPoleShape = (props: any) => {
  const { cx, cy, payload } = props;
  const { selected, count } = payload;
  const size = selected ? 8 : 5;
  const strokeWidth = selected ? 3 : 2;
  const color = selected ? "#4f46e5" : "#e11d48"; // Indigo if selected, else Rose

  return (
    <g>
      {selected && <circle cx={cx} cy={cy} r={size + 4} fill="#4f46e5" fillOpacity={0.2} />}
      <line x1={cx - size} y1={cy - size} x2={cx + size} y2={cy + size} stroke={color} strokeWidth={strokeWidth} />
      <line x1={cx + size} y1={cy - size} x2={cx - size} y2={cy + size} stroke={color} strokeWidth={strokeWidth} />
      {count > 1 && (
        <text 
          x={cx + size + 3} 
          y={cy - size - 3} 
          fill={color} 
          fontSize={11} 
          fontWeight="bold"
          textAnchor="start"
          dominantBaseline="auto"
          style={{ pointerEvents: 'none', textShadow: '0px 0px 2px white' }}
        >
          {count}
        </text>
      )}
    </g>
  );
};

const CustomZeroShape = (props: any) => {
  const { cx, cy, payload } = props;
  const { selected, count } = payload;
  const r = selected ? 8 : 5;
  const strokeWidth = selected ? 3 : 2;
  const color = selected ? "#4f46e5" : "#10b981"; // Indigo if selected, else Emerald

  return (
    <g>
      {selected && <circle cx={cx} cy={cy} r={r + 4} fill="#4f46e5" fillOpacity={0.2} />}
      <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={strokeWidth} fill="white" />
      {count > 1 && (
        <text 
          x={cx + r + 3} 
          y={cy - r - 3} 
          fill={color} 
          fontSize={11} 
          fontWeight="bold"
          textAnchor="start"
          dominantBaseline="auto"
          style={{ pointerEvents: 'none', textShadow: '0px 0px 2px white' }}
        >
          {count}
        </text>
      )}
    </g>
  );
};

export const PoleZeroMap: React.FC<PoleZeroMapProps> = ({ poles, zeros, selectedId }) => {
  // Determine axis domains to keep the chart centered and readable
  const allPoints = [...poles, ...zeros];
  const maxVal = allPoints.reduce((max, p) => Math.max(max, Math.abs(p.real), Math.abs(p.imag)), 5);
  const domainLimit = Math.ceil(maxVal * 1.2);

  const polesData = useMemo(() => groupPoints(poles, 'pole', selectedId), [poles, selectedId]);
  const zerosData = useMemo(() => groupPoints(zeros, 'zero', selectedId), [zeros, selectedId]);

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-4 ml-2">
         <h3 className="text-lg font-semibold text-slate-800">S-Plane (Pole-Zero Map)</h3>
         <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-white inline-block"></span> Zero</div>
            <div className="flex items-center gap-1"><span className="text-rose-600 font-bold">×</span> Pole</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-indigo-600 bg-indigo-100 inline-block"></span> Selected</div>
         </div>
      </div>
      <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="real" 
            name="Real" 
            label={{ value: 'Real Axis (σ)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 12 }}
            domain={[-domainLimit, domainLimit]}
            stroke="#94a3b8"
            tick={{fontSize: 12}}
          />
          <YAxis 
            type="number" 
            dataKey="imag" 
            name="Imaginary" 
            label={{ value: 'Imag Axis (jω)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 12 }}
            domain={[-domainLimit, domainLimit]}
            stroke="#94a3b8"
            tick={{fontSize: 12}}
          />
          <ReferenceLine x={0} stroke="#64748b" strokeWidth={1} />
          <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
          
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
                if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                        <div className="bg-white p-2 border border-slate-200 shadow-lg rounded text-xs font-mono">
                            <p className="font-bold border-b pb-1 mb-1">{data.type === 'pole' ? 'Pole (×)' : 'Zero (○)'}</p>
                            <p>{`Re: ${data.real.toFixed(2)}`}</p>
                            <p>{`Im: ${data.imag.toFixed(2)}j`}</p>
                            {data.count > 1 && <p className="text-slate-600 font-semibold mt-1">Multiplicity: {data.count}</p>}
                            {data.selected && <p className="text-indigo-600 font-bold mt-1">Selected</p>}
                        </div>
                    );
                }
                return null;
            }}
          />
          
          <Scatter name="Zeros" data={zerosData} shape={<CustomZeroShape />}>
            {zerosData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.selected ? '#4f46e5' : '#10b981'} />
            ))}
          </Scatter>
          
          <Scatter name="Poles" data={polesData} shape={<CustomPoleShape />}>
            {polesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.selected ? '#4f46e5' : '#e11d48'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};