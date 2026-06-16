'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { DashboardCharts } from '@/components/features/dashboard/DashboardCharts';
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type DashboardSummary = {
  totalEmissionKg: number;
  regionalAverageKg: number;
  timeRange: string;
  categoryBreakdown: {
    category: string;
    icon: string;
    totalKg: number;
  }[];
  recentActivities: {
    id: string;
    displayName: string;
    emissionKg: number;
    loggedAt: string;
  }[];
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/summary?timeRange=month');
        setSummary(data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard summary', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!summary) {
    return <div className="p-8 text-center text-danger font-medium bg-red-50 rounded-2xl border border-red-100">Failed to load dashboard</div>;
  }

  const topCategory = summary.categoryBreakdown.length > 0 
    ? summary.categoryBreakdown.sort((a,b) => b.totalKg - a.totalKg)[0].category 
    : 'N/A';

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight">Overview</h1>
          <p className="text-text-secondary mt-1">Your carbon footprint footprint at a glance</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="!bg-gradient-to-br !from-forest !to-forest-light !text-white !border-none !shadow-xl !shadow-forest/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider mb-2">This Month&apos;s Emissions</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight">{summary.totalEmissionKg.toFixed(1)}</span>
              <span className="text-white/80 font-medium">kg CO₂e</span>
            </div>
            <div className="mt-4 flex flex-col gap-1 text-sm text-leaf-pale">
              <div className="flex items-center font-medium">
                {summary.totalEmissionKg > summary.regionalAverageKg ? (
                  <ArrowUpRight className="w-4 h-4 mr-1 text-red-300" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1 text-green-300" />
                )}
                <span className={summary.totalEmissionKg > summary.regionalAverageKg ? 'text-red-200' : 'text-green-200'}>
                  {Math.abs(((summary.totalEmissionKg - summary.regionalAverageKg) / summary.regionalAverageKg) * 100).toFixed(0)}% 
                  {summary.totalEmissionKg > summary.regionalAverageKg ? ' higher ' : ' lower '} 
                  than your city avg
                </span>
              </div>
              <span className="text-xs opacity-80">City avg: {summary.regionalAverageKg.toFixed(1)} kg CO₂e</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-2">Highest Impact Category</h3>
            <div>
              <span className="text-3xl font-bold text-text">{topCategory}</span>
              <p className="text-sm text-text-secondary mt-1">Focus reduction efforts here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-2">Activities Logged</h3>
            <div>
              <span className="text-3xl font-bold text-text">{summary.recentActivities.length}+</span>
              <p className="text-sm text-text-secondary mt-1">Consistent tracking builds habits</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-gray-100/50 pb-4">
            <CardTitle>Emissions Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <DashboardCharts data={summary.categoryBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-gray-100/50 pb-4">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {summary.recentActivities.length === 0 ? (
                <div className="text-center py-8 text-text-muted bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No recent activities.</p>
                </div>
              ) : (
                summary.recentActivities.map(activity => (
                  <div key={activity.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-leaf-pale/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-forest/5 text-forest flex items-center justify-center">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text group-hover:text-forest transition-colors">{activity.displayName}</p>
                        <p className="text-xs text-text-secondary">
                          {new Date(activity.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-danger bg-danger/10 px-2 py-1 rounded-md">
                        +{activity.emissionKg.toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
