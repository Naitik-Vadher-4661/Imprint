'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

// Hardcoded categories matching backend database
const CATEGORIES = [
  { id: '11111111-1111-1111-1111-111111111111', type: 'TRANSPORT', name: 'Transport' },
  { id: '22222222-2222-2222-2222-222222222222', type: 'FOOD', name: 'Food' },
  { id: '33333333-3333-3333-3333-333333333333', type: 'ENERGY', name: 'Energy' },
  { id: '44444444-4444-4444-4444-444444444444', type: 'WASTE', name: 'Waste' },
];

// Subcategories with their user-friendly labels and database values
const SUBCATEGORIES: Record<string, { value: string; label: string; unit: string }[]> = {
  // Transport
  '11111111-1111-1111-1111-111111111111': [
    { value: 'car_petrol', label: 'Car (Petrol)', unit: 'KM' },
    { value: 'car_diesel', label: 'Car (Diesel)', unit: 'KM' },
    { value: 'car_electric', label: 'Car (Electric)', unit: 'KM' },
    { value: 'motorcycle', label: 'Motorcycle', unit: 'KM' },
    { value: 'bus', label: 'Bus', unit: 'KM' },
    { value: 'train', label: 'Train', unit: 'KM' },
    { value: 'metro', label: 'Metro / Subway', unit: 'KM' },
    { value: 'flight_short', label: 'Flight (Short-haul)', unit: 'KM' },
    { value: 'flight_long', label: 'Flight (Long-haul)', unit: 'KM' },
    { value: 'bicycle', label: 'Bicycle', unit: 'KM' },
    { value: 'walking', label: 'Walking', unit: 'KM' },
  ],
  // Food
  '22222222-2222-2222-2222-222222222222': [
    { value: 'beef', label: 'Beef', unit: 'KG' },
    { value: 'chicken', label: 'Chicken', unit: 'KG' },
    { value: 'pork', label: 'Pork', unit: 'KG' },
    { value: 'fish', label: 'Fish', unit: 'KG' },
    { value: 'dairy', label: 'Dairy Products', unit: 'KG' },
    { value: 'vegetarian_meal', label: 'Vegetarian Meal', unit: 'MEAL' },
    { value: 'vegan_meal', label: 'Vegan Meal', unit: 'MEAL' },
    { value: 'meat_meal', label: 'Meat-based Meal', unit: 'MEAL' },
    { value: 'food_waste', label: 'Food Waste', unit: 'KG' },
  ],
  // Energy
  '33333333-3333-3333-3333-333333333333': [
    { value: 'electricity', label: 'Electricity', unit: 'KWH' },
    { value: 'natural_gas', label: 'Natural Gas', unit: 'KWH' },
    { value: 'lpg', label: 'LPG', unit: 'KG' },
    { value: 'air_conditioning', label: 'Air Conditioning', unit: 'HOURS' },
    { value: 'heating', label: 'Heating', unit: 'HOURS' },
    { value: 'washing_machine', label: 'Washing Machine', unit: 'COUNT' },
    { value: 'dishwasher', label: 'Dishwasher', unit: 'COUNT' },
  ],
  // Waste
  '44444444-4444-4444-4444-444444444444': [
    { value: 'general_waste', label: 'General Waste', unit: 'KG' },
    { value: 'recycling', label: 'Recycling', unit: 'KG' },
    { value: 'composting', label: 'Composting', unit: 'KG' },
    { value: 'plastic', label: 'Plastic Waste', unit: 'KG' },
    { value: 'paper', label: 'Paper Waste', unit: 'KG' },
    { value: 'e_waste', label: 'Electronic Waste', unit: 'KG' },
  ],
};

interface LogActivityFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const LogActivityForm = ({ onSuccess, onCancel }: LogActivityFormProps) => {
  const [formData, setFormData] = useState({
    categoryId: CATEGORIES[0].id,
    subcategory: 'car_petrol',
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const subcats = SUBCATEGORIES[categoryId] || [];
    const firstSubcat = subcats[0];
    
    setFormData((prev) => ({
      ...prev,
      categoryId,
      subcategory: firstSubcat ? firstSubcat.value : '',
      unit: firstSubcat ? firstSubcat.unit : 'KM',
    }));
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategory = e.target.value;
    const subcats = SUBCATEGORIES[formData.categoryId] || [];
    const matched = subcats.find((s) => s.value === subcategory);
    
    setFormData((prev) => ({
      ...prev,
      subcategory,
      unit: matched ? matched.unit : prev.unit,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const activeSubcategories = SUBCATEGORIES[formData.categoryId] || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm font-medium text-[var(--color-danger)]">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Select */}
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="categoryId" className="text-sm font-medium text-[var(--color-text-primary)]">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            aria-label="Activity Category"
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
            value={formData.categoryId}
            onChange={handleCategoryChange}
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Subcategory Select (Dropdown) */}
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="subcategory" className="text-sm font-medium text-[var(--color-text-primary)]">Subcategory</label>
          <select
            id="subcategory"
            name="subcategory"
            aria-label="Activity Subcategory"
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
            value={formData.subcategory}
            onChange={handleSubcategoryChange}
            required
          >
            {activeSubcategories.map((sub) => (
              <option key={sub.value} value={sub.value}>{sub.label}</option>
            ))}
          </select>
        </div>

        <Input
          label="Display Name (e.g. Morning Commute)"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="e.g. Morning Commute"
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
              placeholder="0.00"
              required
            />
          </div>
          <div className="w-24 flex flex-col gap-1.5">
            <label htmlFor="unit" className="text-sm font-medium text-[var(--color-text-primary)]">Unit</label>
            <select
              id="unit"
              name="unit"
              aria-label="Measurement Unit"
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
              <option value="COUNT">count</option>
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
