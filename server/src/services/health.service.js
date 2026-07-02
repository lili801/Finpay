import { getDatabaseHealth } from '../config/database.js';

export class HealthService {
  getLiveness() {
    return {
      status: 'ok',
      service: 'finpay-api',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  getReadiness() {
    const database = getDatabaseHealth();

    return {
      status: database.healthy ? 'ready' : 'not_ready',
      service: 'finpay-api',
      checks: {
        mongodb: database,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export const healthService = new HealthService();
