'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    country: '',
    householdSize: 1,
    primaryTransport: '',
    dietaryPreference: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.patch('/auth/profile', {
        ...formData,
        onboardingComplete: true,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e.response?.data?.error?.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'householdSize' ? parseInt(value) || 1 : value,
    }));
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 animate-fade-in-up">
      <Card className="w-full max-w-lg shadow-2xl shadow-forest/10 border-white/50">
        <CardHeader className="space-y-3 text-center pb-8 pt-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-leaf to-leaf-light flex items-center justify-center mx-auto shadow-inner mb-2">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-[family-name:var(--font-heading)]">Welcome to Imprint</CardTitle>
          <CardDescription className="text-base">Let&apos;s personalize your experience to give you highly accurate insights.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8">
            {error && <div className="text-sm font-medium text-danger bg-danger/10 p-3 rounded-lg border border-danger/20 text-center">{error}</div>}
            
            <Input
              label="Country"
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g. United States"
              required
            />
            
            <Input
              label="Household Size"
              type="number"
              name="householdSize"
              min={1}
              value={formData.householdSize}
              onChange={handleChange}
              required
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-text">
                Primary Transport
              </label>
              <select
                name="primaryTransport"
                className="select"
                value={formData.primaryTransport}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select option...</option>
                <option value="car_petrol">Petrol Car</option>
                <option value="car_electric">Electric Car</option>
                <option value="public_transit">Public Transit</option>
                <option value="bicycle_walking">Bicycle / Walking</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-text">
                Dietary Preference
              </label>
              <select
                name="dietaryPreference"
                className="select"
                value={formData.dietaryPreference}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select option...</option>
                <option value="omnivore">Omnivore (Meat heavy)</option>
                <option value="flexitarian">Flexitarian (Occasional meat)</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>

          </CardContent>
          <CardFooter className="px-8 pb-8 pt-4">
            <Button type="submit" className="w-full shadow-lg shadow-forest/20 text-md py-3" isLoading={isLoading}>
              Complete Setup
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
