'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

interface CreateGoalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateGoalForm = ({ onSuccess, onCancel }: CreateGoalFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'REDUCTION',
    targetValue: '',
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let parsedEndDate = new Date(formData.endDate);
      if (isNaN(parsedEndDate.getTime())) {
        // Fallback for DD/MM/YYYY or other formats if standard parsing fails
        const parts = formData.endDate.split('/');
        if (parts.length === 3) {
          parsedEndDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }

      await api.post('/goals', {
        ...formData,
        targetValue: parseFloat(formData.targetValue),
        startDate: new Date().toISOString(),
        endDate: parsedEndDate.toISOString(),
      });
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e.response?.data?.error?.message || 'Failed to create goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm font-medium text-[var(--color-danger)]">{error}</div>}
      
      <Input
        label="Goal Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-[var(--color-text-primary)]">Description</label>
        <textarea
          name="description"
          className="h-20 rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] resize-none"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">Type</label>
          <select
            name="type"
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="REDUCTION">Reduction Goal</option>
            <option value="ACTIVITY_COUNT">Activity Count</option>
            <option value="MILESTONE">Milestone</option>
          </select>
        </div>

        <Input
          label="Target Value"
          type="number"
          step="0.01"
          name="targetValue"
          value={formData.targetValue}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label="Deadline (End Date)"
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        required
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Create Goal
        </Button>
      </div>
    </form>
  );
};
