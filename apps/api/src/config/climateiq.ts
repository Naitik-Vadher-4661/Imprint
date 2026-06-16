import { config } from './env';
// Note: climatiq-js is a conceptual library in the TRD, we'll use a basic fetch wrapper if it doesn't exist,
// but assuming it exists as specified in TRD. For this implementation, we will export the base config.

export const climateIqConfig = {
  apiKey: config.CLIMATEIQ_API_KEY,
  baseURL: 'https://beta3.api.climatiq.io',
};
