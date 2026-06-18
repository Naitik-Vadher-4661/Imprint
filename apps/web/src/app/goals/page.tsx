'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Target, CheckCircle, Flame, Plus, Award, X } from 'lucide-react';
import { CreateGoalForm } from '@/components/features/goals/CreateGoalForm';

type Goal = {
  id: string;
  name: string;
  description: string;
  type: string;
  targetValue: number;
  currentValue: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  endDate: string;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedGoalData, setCompletedGoalData] = useState<{ name: string; targetValue: number; newBadges: string[] } | null>(null);

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/goals');
      setGoals(data.data);
    } catch (error) {
      console.error('Failed to fetch goals', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    setCompletingId(goalId);
    try {
      const { data } = await api.post(`/goals/${goalId}/complete`);
      const { goal, newBadges } = data.data;
      
      // Update local state
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...goal } : g));
      
      setCompletedGoalData({
        name: goal.name,
        targetValue: goal.targetValue,
        newBadges: newBadges || []
      });
    } catch (err: unknown) {
      console.error('Failed to complete goal', err);
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      alert(error.response?.data?.error?.message || 'Failed to complete goal');
    } finally {
      setCompletingId(null);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight">Your Goals</h1>
          <p className="text-text-secondary mt-1">Set targets, track progress, and build sustainable habits.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-md shadow-forest/20">
          <Plus className="w-5 h-5 mr-1" /> Create Goal
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-text">Create New Goal</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <CreateGoalForm 
                onSuccess={() => {
                  setIsModalOpen(false);
                  fetchGoals();
                }}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Goal Completion Success Modal ─── */}
      {completedGoalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-fade-in-up border border-green-100">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
            
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-green-600">
              <Award className="w-12 h-12" />
            </div>

            <h2 className="text-3xl font-extrabold text-text mb-2 font-[family-name:var(--font-heading)]">Goal Completed!</h2>
            <p className="text-text-secondary mb-6 text-base">
              Fantastic work! You completed your goal: <strong className="text-forest">"{completedGoalData.name}"</strong>.
            </p>

            <div className="bg-green-50/50 border border-green-100/50 rounded-2xl p-5 mb-6 text-left">
              <h3 className="text-sm font-bold uppercase tracking-wider text-green-700 mb-3 flex items-center gap-1.5">
                🌱 Environmental Impact
              </h3>
              <ul className="space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-base select-none">📉</span>
                  <span><strong>{completedGoalData.targetValue.toFixed(1)} kg</strong> of CO₂e emissions avoided.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base select-none">🌳</span>
                  <span>Equivalent to planting <strong>{Math.max(1, Math.round(completedGoalData.targetValue / 1.8))}</strong> tree(s) absorbing CO₂ for an entire month!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base select-none">🚗</span>
                  <span>Avoids the carbon footprint of driving a car for <strong>{Math.round(completedGoalData.targetValue / 0.4)}</strong> miles.</span>
                </li>
              </ul>
            </div>

            {completedGoalData.newBadges && completedGoalData.newBadges.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-5 mb-6 text-left">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                  🏆 New Badges Unlocked!
                </h3>
                <p className="text-sm text-text-secondary">
                  You unlocked: <strong>{completedGoalData.newBadges.join(', ')}</strong>
                </p>
              </div>
            )}

            <Button 
              onClick={() => setCompletedGoalData(null)} 
              className="w-full text-md py-3 shadow-lg shadow-forest/20"
            >
              Keep it up!
            </Button>
          </div>
        </div>
      )}


      {goals.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
          <CardContent className="py-16 text-center text-text-muted">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-text">No active goals</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">Setting concrete goals is the most effective way to reduce your carbon footprint.</p>
            <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="mt-6">Create your first goal</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, idx) => {
            const progressPercent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isCompleted = goal.status === 'COMPLETED';

            return (
              <Card key={goal.id} className={`overflow-hidden transition-all delay-${(idx % 4 + 1) * 100} ${isCompleted ? 'bg-gradient-to-br from-green-50 to-white border-green-200' : 'hover:border-leaf/50'}`}>
                {isCompleted && (
                  <div className="bg-green-500 text-white text-xs font-bold uppercase tracking-wider text-center py-1 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Goal Achieved
                  </div>
                )}
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isCompleted ? 'bg-green-500 text-white' : 'bg-gradient-to-br from-forest-light to-forest text-white'}`}>
                    {isCompleted ? <Award className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                  </div>
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg leading-tight">{goal.name}</CardTitle>
                    <CardDescription className="text-xs font-medium flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      Deadline: {new Date(goal.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm text-text-secondary leading-relaxed">{goal.description}</p>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-text-secondary uppercase tracking-wider">Progress</span>
                      <span className={isCompleted ? 'text-green-600' : 'text-forest'}>{progressPercent}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200/80 shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-leaf to-forest-light'}`} 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-medium text-text-muted mt-2">
                      <span>{goal.currentValue.toFixed(1)} completed</span>
                      <span>{goal.targetValue.toFixed(1)} target</span>
                    </div>
                  </div>

                  {!isCompleted && (
                    <Button 
                      className="w-full text-sm font-semibold py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm"
                      onClick={() => handleCompleteGoal(goal.id)}
                      isLoading={completingId === goal.id}
                    >
                      <CheckCircle className="w-4 h-4" /> Mark as Complete
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
