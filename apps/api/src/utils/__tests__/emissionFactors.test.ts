import { EmissionFactorService } from '../emissionFactors';
import { redis } from '../../config/redis';
import { prisma } from '../../config/database';


jest.mock('../../config/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
  },
}));

jest.mock('../../config/database', () => ({
  prisma: {
    emissionFactor: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../config/env', () => ({
  config: {
    CLIMATEIQ_API_KEY: '', // Disable API calls in tests so we test cache + static fallback
  },
}));

describe('EmissionFactorService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFactorKgCo2e', () => {
    it('should return cached emission factor when available', async () => {
      const cachedResult = { factor: 0.12, unit: 'KM', source: 'ClimateIQ API' };
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedResult));

      const result = await EmissionFactorService.getFactorKgCo2e('cat-1', 'car_petrol', 'US');

      expect(redis.get).toHaveBeenCalledWith('emission_factor:car_petrol:US');
      expect(result).toEqual(cachedResult);
      // Should NOT query database when cache hit
      expect(prisma.emissionFactor.findUnique).not.toHaveBeenCalled();
    });

    it('should fall back to static database when cache misses and no API key', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.emissionFactor.findUnique as jest.Mock).mockResolvedValue({
        factorKgCo2e: 0.15,
        unit: 'KM',
        source: 'Static DB',
      });

      const result = await EmissionFactorService.getFactorKgCo2e('cat-1', 'car_petrol', 'US');

      expect(prisma.emissionFactor.findUnique).toHaveBeenCalledWith({
        where: {
          categoryId_subcategory_region: {
            categoryId: 'cat-1',
            subcategory: 'car_petrol',
            region: 'global',
          },
        },
      });
      expect(result).toEqual({ factor: 0.15, unit: 'KM', source: 'Static DB' });
      // Should cache the static fallback for 1 hour
      expect(redis.setex).toHaveBeenCalledWith(
        'emission_factor:car_petrol:US',
        3600,
        expect.any(String)
      );
    });

    it('should throw AppError when no emission factor found anywhere', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.emissionFactor.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        EmissionFactorService.getFactorKgCo2e('cat-1', 'unknown_activity', 'US')
      ).rejects.toThrow('No emission factor found for unknown_activity');
    });

    it('should use default region "global" when no region specified', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.emissionFactor.findUnique as jest.Mock).mockResolvedValue({
        factorKgCo2e: 0.2,
        unit: 'KWH',
        source: 'Static DB',
      });

      await EmissionFactorService.getFactorKgCo2e('cat-2', 'electricity');

      expect(redis.get).toHaveBeenCalledWith('emission_factor:electricity:global');
    });
  });
});
