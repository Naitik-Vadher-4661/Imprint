import { CreateGoalSchema } from '../goals.schema';

describe('CreateGoalSchema', () => {
  const validGoal = {
    name: 'Reduce transport emissions',
    type: 'REDUCTION_PERCENTAGE',
    targetValue: 10,
    endDate: '2026-07-01T00:00:00.000Z',
  };

  it('should validate a minimal valid goal', () => {
    const result = CreateGoalSchema.safeParse(validGoal);
    expect(result.success).toBe(true);
  });

  it('should validate a goal with all optional fields', () => {
    const fullGoal = {
      ...validGoal,
      description: 'Cut transport emissions by 10%',
      startDate: '2026-06-01T00:00:00.000Z',
      presetId: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      baselineValue: 100,
    };

    const result = CreateGoalSchema.safeParse(fullGoal);
    expect(result.success).toBe(true);
  });

  it('should reject empty goal name', () => {
    const result = CreateGoalSchema.safeParse({ ...validGoal, name: '' });
    expect(result.success).toBe(false);
  });

  it('should reject goal name longer than 100 characters', () => {
    const result = CreateGoalSchema.safeParse({ ...validGoal, name: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('should reject description longer than 500 characters', () => {
    const result = CreateGoalSchema.safeParse({ ...validGoal, description: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('should reject negative targetValue', () => {
    const result = CreateGoalSchema.safeParse({ ...validGoal, targetValue: -5 });
    expect(result.success).toBe(false);
  });

  it('should reject zero targetValue', () => {
    const result = CreateGoalSchema.safeParse({ ...validGoal, targetValue: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject missing endDate', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { endDate: _endDate, ...goalWithoutEnd } = validGoal;
    const result = CreateGoalSchema.safeParse(goalWithoutEnd);
    expect(result.success).toBe(false);
  });

  it('should reject invalid endDate format', () => {
    const result = CreateGoalSchema.safeParse({ ...validGoal, endDate: 'next-week' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid presetId (not UUID)', () => {
    const result = CreateGoalSchema.safeParse({ ...validGoal, presetId: 'not-uuid' });
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const result = CreateGoalSchema.safeParse({});
    expect(result.success).toBe(false);

    if (!result.success) {
      const fieldNames = result.error.issues.map(i => i.path[0]);
      expect(fieldNames).toContain('name');
      expect(fieldNames).toContain('type');
      expect(fieldNames).toContain('targetValue');
      expect(fieldNames).toContain('endDate');
    }
  });
});
