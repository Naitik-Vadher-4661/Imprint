'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { LogActivityForm } from '@/components/features/activities/LogActivityForm';
import { Activity, Plus, Trash2 } from 'lucide-react';

type ActivityItem = {
  id: string;
  displayName: string;
  value: number;
  unit: string;
  emissionKg: number;
  loggedAt: string;
  category: {
    name: string;
    icon: string;
  };
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchActivities = async () => {
    try {
      const { data } = await api.get('/activities?limit=20');
      setActivities(data.data.items);
    } catch (error) {
      console.error('Failed to fetch activities', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await api.delete(`/activities/${id}`);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete activity', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight">Activities</h1>
          <p className="text-text-secondary mt-1">Log and track your daily footprint</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="shadow-md shadow-forest/20">
          {showForm ? 'Cancel' : <><Plus className="w-5 h-5 mr-1" /> Log Activity</>}
        </Button>
      </div>

      {showForm && (
        <Card className="animate-slide-down border-forest/20 shadow-lg shadow-forest/5">
          <CardHeader className="bg-forest/5 border-b border-forest/10">
            <CardTitle className="text-forest">New Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <LogActivityForm 
              onSuccess={() => {
                setShowForm(false);
                fetchActivities();
              }}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="border-b border-gray-100/50">
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {activities.length === 0 ? (
            <div className="py-16 text-center text-text-muted bg-gray-50 rounded-b-xl border-t border-dashed border-gray-200 mt-6">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium text-text">No activities yet</p>
              <p className="text-sm mt-1">Click &apos;Log Activity&apos; to start tracking your footprint.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/80 mt-2">
              {activities.map((activity) => (
                <div key={activity.id} className="group py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-leaf-pale/5 px-4 -mx-4 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-forest/5 flex items-center justify-center text-2xl shadow-sm border border-forest/10">
                      {activity.category.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-text group-hover:text-forest transition-colors">{activity.displayName}</p>
                      <p className="text-sm text-text-secondary flex items-center gap-2 mt-0.5">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{activity.category.name}</span>
                        <span>•</span>
                        <span>{activity.value} {activity.unit.toLowerCase()}</span>
                        <span>•</span>
                        <span>{new Date(activity.loggedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48 pl-16 sm:pl-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-danger bg-danger/10 px-2.5 py-1 rounded-md inline-block">
                        +{activity.emissionKg.toFixed(2)} kg CO₂e
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDelete(activity.id)}
                      className="text-text-muted hover:text-danger p-2 rounded-full hover:bg-danger/10 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
