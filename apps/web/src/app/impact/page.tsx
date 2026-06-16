'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { TreePine, Car, Smartphone, Globe } from 'lucide-react';

export default function ImpactPage() {
  const [totalEmission, setTotalEmission] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        const { data } = await api.get('/dashboard/summary?timeRange=year');
        setTotalEmission(data.data.totalEmissionKg);
      } catch (err) {
        console.error('Failed to fetch dashboard summary', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmissions();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (totalEmission === null) {
    return <div className="p-8 text-center text-danger">Failed to load impact data.</div>;
  }

  // Equivalencies Math
  // 1 tree absorbs ~21kg CO2 per year
  const treesNeeded = Math.ceil(totalEmission / 21);
  // Avg passenger car emits ~0.400 kg CO2e per mile
  const milesDriven = Math.round(totalEmission / 0.400);
  // 1 smartphone charge emits ~0.0082 kg CO2
  const smartphonesCharged = Math.round(totalEmission / 0.0082);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight">Your Impact</h1>
          <p className="text-text-secondary mt-1">Understanding your carbon footprint in real-world terms.</p>
        </div>
        <div className="bg-forest/10 px-4 py-2 rounded-full border border-forest/20 flex items-center gap-2">
          <Globe className="w-5 h-5 text-forest" />
          <span className="font-bold text-forest">{totalEmission.toFixed(1)} kg CO₂e Total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-leaf/50 transition-colors group overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <TreePine className="w-48 h-48 text-forest" />
          </div>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4 shadow-sm">
              <TreePine className="w-6 h-6" />
            </div>
            <CardTitle>Trees Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-text mb-2">{treesNeeded}</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              It would take {treesNeeded} mature trees a full year to absorb the carbon dioxide you&apos;ve emitted.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-leaf/50 transition-colors group overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Car className="w-48 h-48 text-orange-600" />
          </div>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 shadow-sm">
              <Car className="w-6 h-6" />
            </div>
            <CardTitle>Miles Driven</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-text mb-2">{milesDriven.toLocaleString()}</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your footprint is equivalent to driving {milesDriven.toLocaleString()} miles in an average gasoline-powered passenger vehicle.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-leaf/50 transition-colors group overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Smartphone className="w-48 h-48 text-blue-600" />
          </div>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
              <Smartphone className="w-6 h-6" />
            </div>
            <CardTitle>Smartphones Charged</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-text mb-2">{smartphonesCharged.toLocaleString()}</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your emissions are equivalent to charging {smartphonesCharged.toLocaleString()} smartphones from 0 to 100%.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
