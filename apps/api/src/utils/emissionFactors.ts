import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { MeasurementUnit } from '../types/enums';
// In a real implementation we would import from 'climatiq-js'
// import { Climatiq } from 'climatiq-js';

// Conceptual wrapper for ClimateIQ
class ClimateIQService {
  async getFactor(subcategory: string, region: string): Promise<any> {
    // This is a stub for the actual API call
    // return climatiq.estimate({ category: subcategory, region })
    return null; // returning null falls back to static DB values
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
      throw new Error(`No emission factor found for ${subcategory}`);
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
