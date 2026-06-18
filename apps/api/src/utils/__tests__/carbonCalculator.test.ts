import { CarbonCalculator } from '../carbonCalculator';
import { EmissionFactorService } from '../emissionFactors';
import { MeasurementUnit } from '../../types/enums';

jest.mock('../emissionFactors', () => ({
  EmissionFactorService: {
    getFactorKgCo2e: jest.fn(),
  },
}));

describe('CarbonCalculator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateEmission', () => {
    it('should return 0 emissions for bicycle', async () => {
      const result = await CarbonCalculator.calculateEmission(
        'cat-1',
        'bicycle',
        10,
        MeasurementUnit.KM
      );
      expect(result).toEqual({
        emissionKg: 0,
        source: 'Zero emission',
      });
      expect(EmissionFactorService.getFactorKgCo2e).not.toHaveBeenCalled();
    });

    it('should return 0 emissions for walking', async () => {
      const result = await CarbonCalculator.calculateEmission(
        'cat-1',
        'walking',
        5,
        MeasurementUnit.KM
      );
      expect(result).toEqual({
        emissionKg: 0,
        source: 'Zero emission',
      });
      expect(EmissionFactorService.getFactorKgCo2e).not.toHaveBeenCalled();
    });

    it('should query emission factors and calculate emissions correctly', async () => {
      (EmissionFactorService.getFactorKgCo2e as jest.Mock).mockResolvedValue({
        factor: 0.12,
        unit: 'KM',
        source: 'Static DB',
      });

      const result = await CarbonCalculator.calculateEmission(
        'cat-1',
        'car_petrol',
        100,
        MeasurementUnit.KM
      );

      expect(EmissionFactorService.getFactorKgCo2e).toHaveBeenCalledWith(
        'cat-1',
        'car_petrol',
        'global'
      );
      expect(result).toEqual({
        emissionKg: 12,
        source: 'Static DB',
      });
    });

    it('should apply unit conversions (e.g. LITERS to KG for petrol density)', async () => {
      (EmissionFactorService.getFactorKgCo2e as jest.Mock).mockResolvedValue({
        factor: 2.3,
        unit: 'KG',
        source: 'Static DB',
      });

      const result = await CarbonCalculator.calculateEmission(
        'cat-1',
        'car_petrol',
        10,
        MeasurementUnit.LITERS
      );

      // 10 Liters -> 10 * 0.74 = 7.4 KG
      // 7.4 KG * 2.3 = 17.02
      expect(result).toEqual({
        emissionKg: 17.02,
        source: 'Static DB',
      });
    });
  });
});
