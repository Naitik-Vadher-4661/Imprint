import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { MeasurementUnit } from '../types/enums';
import { config } from '../config/env';
import { AppError } from './AppError';

// Map subcategories to Climatiq activity IDs and parameters
const CLIMATIQ_MAPPINGS: Record<string, { activityId: string; param: string; unit: string }> = {
  car_petrol: { activityId: 'passenger_vehicle-vehicle_type_car-fuel_source_petrol', param: 'distance', unit: 'km' },
  car_diesel: { activityId: 'passenger_vehicle-vehicle_type_car-fuel_source_diesel', param: 'distance', unit: 'km' },
  car_electric: { activityId: 'passenger_vehicle-vehicle_type_car-fuel_source_electricity', param: 'distance', unit: 'km' },
  bus: { activityId: 'passenger_vehicle-vehicle_type_bus-fuel_source_na', param: 'distance', unit: 'km' },
  train: { activityId: 'passenger_vehicle-vehicle_type_train-fuel_source_na', param: 'distance', unit: 'km' },
  electricity: { activityId: 'electricity-supply', param: 'energy', unit: 'kWh' },
  natural_gas: { activityId: 'natural_gas-combustion', param: 'energy', unit: 'kWh' },
  beef: { activityId: 'agriculture-livestock-cattle', param: 'weight', unit: 'kg' },
  chicken: { activityId: 'agriculture-poultry-chicken', param: 'weight', unit: 'kg' },
  general_waste: { activityId: 'waste-municipal_solid_waste', param: 'weight', unit: 'kg' },
};

// Real integration wrapper for ClimateIQ
class ClimateIQService {
  async getFactor(subcategory: string, region: string): Promise<{ factor: number; unit: string } | null> {
    if (!config.CLIMATEIQ_API_KEY) return null;

    const mapping = CLIMATIQ_MAPPINGS[subcategory];
    if (!mapping) return null;

    try {
      const payload = {
        emission_factor: {
          activity_id: mapping.activityId,
          region: region === 'global' ? 'US' : region,
        },
        parameters: {
          [mapping.param]: 1,
          [`${mapping.param}_unit`]: mapping.unit,
        },
      };

      const response = await fetch('https://api.climatiq.io/data/v1/estimate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.CLIMATEIQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(`Climatiq API returned status ${response.status}: ${await response.text()}`);
        return null;
      }

      const data = await response.json() as { co2e?: number };
      return {
        factor: data.co2e || 0,
        unit: mapping.unit.toUpperCase(),
      };
    } catch (err) {
      console.error('Error fetching from Climatiq API:', err);
      return null;
    }
  }
}

const climateIq = new ClimateIQService();

export class EmissionFactorService {
  /**
   * Fetches emission factor from Cache -> ClimateIQ API -> Static DB Fallback
   */
  static async getFactorKgCo2e(
    categoryId: string,
    subcategory: string,
    region: string = 'global'
  ): Promise<{ factor: number; unit: MeasurementUnit; source: string }> {
    const cacheKey = `emission_factor:${subcategory}:${region}`;

    // 1. Check Cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Try ClimateIQ API
    try {
      const apiFactor = await climateIq.getFactor(subcategory, region);
      if (apiFactor) {
        const result = { factor: apiFactor.factor, unit: apiFactor.unit as MeasurementUnit, source: 'ClimateIQ API' };
        await redis.setex(cacheKey, 86400, JSON.stringify(result)); // 24h TTL
        return result;
      }
    } catch (err) {
      console.warn('⚠️ ClimateIQ API failed, falling back to static database values', err);
    }

    // 3. Static Database Fallback
    const staticFactor = await prisma.emissionFactor.findUnique({
      where: {
        categoryId_subcategory_region: {
          categoryId,
          subcategory,
          region: 'global', // fallback always to global
        },
      },
    });

    if (!staticFactor) {
      throw AppError.notFound(`No emission factor found for ${subcategory}`);
    }

    const result = {
      factor: staticFactor.factorKgCo2e,
      unit: staticFactor.unit as MeasurementUnit,
      source: staticFactor.source,
    };

    // Cache the static fallback for a shorter time to retry API later
    await redis.setex(cacheKey, 3600, JSON.stringify(result)); // 1h TTL

    return result;
  }
}

