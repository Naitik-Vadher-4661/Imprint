'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { Award, Star, CheckCircle, Lock } from 'lucide-react';

type Task = {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  durationDays: number;
  difficulty: string;
  icon: string;
};

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      const [tasksRes, badgesRes] = await Promise.all([
        api.get('/gamification/tasks'),
        api.get('/gamification/badges'),
      ]);
      setTasks(tasksRes.data.data);
      setBadges(badgesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch gamification data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptTask = async (presetId: string) => {
    setAcceptingId(presetId);
    setErrorMsg('');
    try {
      await api.post('/gamification/tasks/accept', { presetId });
      // Remove or mark as active? Let's just alert success for now.
      alert('Task accepted! It has been added to your goals.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setErrorMsg(error.response?.data?.error?.message || 'Failed to accept task');
    } finally {
      setAcceptingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const unlockedBadges = badges.filter(b => b.isUnlocked);
  const lockedBadges = badges.filter(b => !b.isUnlocked);

  return (
    <div className="space-y-12 animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight">Tasks & Achievements</h1>
        <p className="text-text-secondary mt-1">Complete tasks to build habits and earn badges.</p>
        {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
      </div>

      {/* Tasks Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-text">Available Tasks</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <Card key={task.id} className="hover:border-leaf/50 transition-colors">
              <CardHeader className="pb-3 flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest-light to-forest text-white flex items-center justify-center text-xl shadow-inner">
                  {task.icon || '🎯'}
                </div>
                <div>
                  <CardTitle className="text-lg leading-tight">{task.name}</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold text-forest mt-1">
                    {task.difficulty} • {task.durationDays} Days
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-text-secondary h-10">{task.description}</p>
                <Button 
                  className="w-full" 
                  onClick={() => handleAcceptTask(task.id)}
                  isLoading={acceptingId === task.id}
                >
                  Start Task
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-forest" />
          <h2 className="text-2xl font-bold text-text">Your Badges</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {unlockedBadges.map(badge => (
            <div key={badge.id} className="bg-gradient-to-b from-white to-green-50 border border-green-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-2 right-2 text-green-500">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">{badge.icon}</div>
              <h3 className="font-bold text-text text-sm leading-tight">{badge.name}</h3>
              <p className="text-[10px] text-text-secondary mt-1">{badge.description}</p>
            </div>
          ))}

          {lockedBadges.map(badge => (
            <div key={badge.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center opacity-70 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-600 text-sm leading-tight">{badge.name}</h3>
              <p className="text-[10px] text-gray-400 mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
