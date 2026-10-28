import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface ResourceChartProps {
  cpuHistory?: number[];
  memoryHistory?: number[];
  currentTime: number;
}

export const ResourceChart: React.FC<ResourceChartProps> = ({ cpuHistory = [], memoryHistory = [], currentTime }) => {
  // Construct recent 30 ticks data points
  const pointsCount = Math.min(cpuHistory.length, 30);
  const data = [];

  const startIndex = Math.max(0, cpuHistory.length - 30);
  for (let i = startIndex; i < cpuHistory.length; i++) {
    data.push({
      tick: `T${i}`,
      cpu: cpuHistory[i] ?? 0,
      memory: memoryHistory[i] ?? 0,
    });
  }

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Real-Time Resource Saturation</h3>
          <p className="text-xs text-slate-400">Sliding window CPU & Memory utilization history (%)</p>
        </div>
        <div className="text-xs font-mono text-cyan-400">
          Current Tick: {currentTime}
        </div>
      </div>

      <div className="h-56 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
            Awaiting simulation tick telemetry...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="tick" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="cpu"
                name="CPU Utilization"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="memory"
                name="Memory Utilization"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
