import { CreateActivitySchema } from '../activity.schema';
import { MeasurementUnit } from '../../../types/enums';

describe('CreateActivitySchema', () => {
  it('should validate a correct activity input', () => {
    const validInput = {
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      subcategory: 'car_petrol',
      displayName: 'Daily commute',
      value: 25,
      unit: MeasurementUnit.KM,
    };

    const result = CreateActivitySchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should accept all optional fields', () => {
    const validInput = {
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      subcategory: 'electricity',
      displayName: 'Monthly electricity',
      value: 300,
      unit: MeasurementUnit.KWH,
      notes: 'High usage month',
      loggedAt: '2026-06-15T10:00:00.000Z',
      isQuickLog: true,
    };

    const result = CreateActivitySchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const result = CreateActivitySchema.safeParse({});
    expect(result.success).toBe(false);

    if (!result.success) {
      const fieldNames = result.error.issues.map(i => i.path[0]);
      expect(fieldNames).toContain('categoryId');
      expect(fieldNames).toContain('subcategory');
      expect(fieldNames).toContain('value');
    }
  });

  it('should reject invalid UUID for categoryId', () => {
    const result = CreateActivitySchema.safeParse({
      categoryId: 'not-a-uuid',
      subcategory: 'car',
      displayName: 'test',
      value: 10,
      unit: MeasurementUnit.KM,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative values', () => {
    const result = CreateActivitySchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      subcategory: 'car',
      displayName: 'test',
      value: -5,
      unit: MeasurementUnit.KM,
    });
    expect(result.success).toBe(false);
  });

  it('should reject zero value', () => {
    const result = CreateActivitySchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      subcategory: 'car',
      displayName: 'test',
      value: 0,
      unit: MeasurementUnit.KM,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid measurement unit', () => {
    const result = CreateActivitySchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      subcategory: 'car',
      displayName: 'test',
      value: 10,
      unit: 'INVALID_UNIT',
    });
    expect(result.success).toBe(false);
  });

  it('should reject notes longer than 500 characters', () => {
    const result = CreateActivitySchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      subcategory: 'car',
      displayName: 'test',
      value: 10,
      unit: MeasurementUnit.KM,
      notes: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid datetime for loggedAt', () => {
    const result = CreateActivitySchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      subcategory: 'car',
      displayName: 'test',
      value: 10,
      unit: MeasurementUnit.KM,
      loggedAt: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('should validate all MeasurementUnit enum values', () => {
    const units = Object.values(MeasurementUnit);
    units.forEach(unit => {
      const result = CreateActivitySchema.safeParse({
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        subcategory: 'test',
        displayName: 'test',
        value: 1,
        unit,
      });
      expect(result.success).toBe(true);
    });
  });
});
