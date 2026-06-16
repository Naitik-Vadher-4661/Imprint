'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { User, Settings, Save } from 'lucide-react';

type ProfileData = {
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
  profile: {
    country: string | null;
    householdSize: number | null;
    primaryTransport: string | null;
    dietaryPreference: string | null;
    measurementSystem: string;
  };
};

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    householdSize: '',
    primaryTransport: '',
    dietType: '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setData(response.data.data);
        const p = response.data.data.profile;
        setFormData({
          country: p?.country || '',
          householdSize: p?.householdSize?.toString() || '1',
          primaryTransport: p?.primaryTransport || '',
          dietType: p?.dietaryPreference || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.patch('/auth/profile', {
        ...formData,
        householdSize: parseInt(formData.householdSize, 10),
      });
      setSuccessMsg('Profile updated successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setErrorMsg(error.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-danger">Failed to load profile.</div>;

  return (
    <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight">Your Profile</h1>
          <p className="text-text-secondary mt-1">Manage your account settings and preferences.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100/50 pb-4 flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest">
            <User className="w-5 h-5" />
          </div>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Name</p>
              <p className="font-medium text-text">{data.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Email</p>
              <p className="font-medium text-text">{data.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Member Since</p>
              <p className="font-medium text-text">{new Date(data.user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-gray-100/50 pb-4 flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest">
            <Settings className="w-5 h-5" />
          </div>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            {successMsg && <div className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md">{successMsg}</div>}
            {errorMsg && <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">{errorMsg}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Country / Region"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
              <Input
                label="Household Size"
                name="householdSize"
                type="number"
                min="1"
                value={formData.householdSize}
                onChange={handleChange}
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-text">Primary Transport</label>
                <select
                  name="primaryTransport"
                  className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/50"
                  value={formData.primaryTransport}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="CAR_PETROL">Petrol Car</option>
                  <option value="CAR_DIESEL">Diesel Car</option>
                  <option value="CAR_ELECTRIC">Electric Car</option>
                  <option value="PUBLIC_TRANSIT">Public Transit</option>
                  <option value="BICYCLE">Bicycle / Walk</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-text">Dietary Preference</label>
                <select
                  name="dietType"
                  className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/50"
                  value={formData.dietType}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="MEAT_HEAVY">Meat Heavy</option>
                  <option value="OMNIVORE">Average Omnivore</option>
                  <option value="PESCATARIAN">Pescatarian</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isSaving} className="gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
