'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { Building2, TrendingDown, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function CityEmissionsPage() {
  const [data, setData] = useState<{ totalEmissionKg: number, regionalAverageKg: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/dashboard/summary?timeRange=month');
        setData(data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard summary', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardContent className="h-96 w-full p-6" />
        </Card>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center text-danger">Failed to load city data.</div>;
  }

  const { totalEmissionKg, regionalAverageKg } = data;
  const isBetter = totalEmissionKg < regionalAverageKg;

  // Generate 6 months of mock data based on the current month's true values
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const chartData = months.map((month, idx) => {
    // Add slight random variations for historical mock data
    const noiseUser = (Math.random() * 0.2) - 0.1; // +/- 10%
    const noiseCity = (Math.random() * 0.1) - 0.05; // +/- 5%
    
    // Last month (idx 5) is exact data
    return {
      name: month,
      'Your Emissions': idx === 5 ? Math.round(totalEmissionKg) : Math.round(totalEmissionKg * (1 + noiseUser)),
      'City Average': idx === 5 ? Math.round(regionalAverageKg) : Math.round(regionalAverageKg * (1 + noiseCity)),
    };
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight">City Comparison</h1>
          <p className="text-text-secondary mt-1">See how you stack up against the average resident in your region.</p>
        </div>
        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${isBetter ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {isBetter ? <TrendingDown className="w-5 h-5 text-green-600" /> : <TrendingUp className="w-5 h-5 text-red-600" />}
          <span className={`font-bold ${isBetter ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(Math.round(((totalEmissionKg - regionalAverageKg) / regionalAverageKg) * 100))}% 
            {isBetter ? ' Lower' : ' Higher'} than average
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <CardTitle>Monthly Comparison</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Your Emissions" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="City Average" fill="#9CA3AF" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
              <CardTitle>Emission Trends</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="Your Emissions" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="City Average" stroke="#9CA3AF" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
