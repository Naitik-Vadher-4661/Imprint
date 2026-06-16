import { MeasurementUnit } from '../types/enums';
import { EmissionFactorService } from './emissionFactors';

export class CarbonCalculator {
  /**
   * Standardizes units to the base unit required by the emission factor.
   */
  private static convertUnit(value: number, fromUnit: MeasurementUnit, toUnit: MeasurementUnit): number {
    if (fromUnit === toUnit) return value;
    
    // Example basic conversions, real app would have robust conversion map
    if (fromUnit === 'LITERS' && toUnit === 'KG') return value * 0.74; // example petrol density
    // ... other conversions ...
    
    return value;
  }

  /**
   * Calculates the CO2e emissions for a given activity
   */
  static async calculateEmission(
    categoryId: string,
    subcategory: string,
    value: number,
    inputUnit: MeasurementUnit,
    region: string = 'global'
  ): Promise<{ emissionKg: number; source: string }> {
    // 1. Edge cases: Zero emission activities
    if (subcategory === 'bicycle' || subcategory === 'walking') {
      return { emissionKg: 0, source: 'Zero emission' };
    }

    // 2. Fetch the appropriate emission factor
    const { factor, unit: factorUnit, source } = await EmissionFactorService.getFactorKgCo2e(
      categoryId,
      subcategory,
      region
    );

    // 3. Convert input value to match the factor's expected unit
    const convertedValue = this.convertUnit(value, inputUnit, factorUnit);

    // 4. Calculate total emissions (factor is kg CO2e per unit)
    const emissionKg = convertedValue * factor;

    return {
      emissionKg: Number(emissionKg.toFixed(4)), // round to 4 decimals
      source,
    };
  }
}
