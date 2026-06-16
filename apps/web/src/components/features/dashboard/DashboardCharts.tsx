'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type ChartProps = {
  data: {
    category: string;
    totalKg: number;
  }[];
};

const COLORS = ['#2d5a27', '#4caf50', '#8d6e63', '#f9a826', '#d32f2f'];

export const DashboardCharts = ({ data }: ChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-[var(--color-text-muted)]">
        Not enough data to display chart
      </div>
    );
  }

  const chartData = data.map(d => ({
    name: d.category,
    value: Number(d.totalKg.toFixed(2))
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} kg CO₂e`, 'Emissions']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
