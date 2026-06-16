'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

// For simplicity, hardcoding common categories in frontend.
// In a real app, these would be fetched from /api/v1/categories.
const CATEGORIES = [
  { id: '11111111-1111-1111-1111-111111111111', type: 'TRANSPORT', name: 'Transport' },
  { id: '22222222-2222-2222-2222-222222222222', type: 'FOOD', name: 'Food' },
  { id: '33333333-3333-3333-3333-333333333333', type: 'ENERGY', name: 'Energy' },
  { id: '44444444-4444-4444-4444-444444444444', type: 'WASTE', name: 'Waste' },
];

interface LogActivityFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const LogActivityForm = ({ onSuccess, onCancel }: LogActivityFormProps) => {
  const [formData, setFormData] = useState({
    categoryId: CATEGORIES[0].id,
    subcategory: '',
    displayName: '',
    value: '',
    unit: 'KM',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/activities', {
        ...formData,
        value: parseFloat(formData.value),
      });
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e.response?.data?.error?.message || 'Failed to log activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm font-medium text-[var(--color-danger)]">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">Category</label>
          <select
            name="categoryId"
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <Input
          label="Subcategory (e.g. car_petrol)"
          name="subcategory"
          value={formData.subcategory}
          onChange={handleChange}
          required
        />

        <Input
          label="Display Name (e.g. Morning Commute)"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          required
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="Value"
              type="number"
              step="0.01"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-24 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">Unit</label>
            <select
              name="unit"
              className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
              value={formData.unit}
              onChange={handleChange}
              required
            >
              <option value="KM">km</option>
              <option value="KG">kg</option>
              <option value="KWH">kWh</option>
              <option value="HOURS">hours</option>
              <option value="MEAL">meal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Save Activity
        </Button>
      </div>
    </form>
  );
};
