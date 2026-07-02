import { successResponse } from '../utils/api-response.js';

export class HealthController {
  constructor(healthService) {
    this.healthService = healthService;
  }

  liveness = async (_request, response) => {
    response.status(200).json(
      successResponse({
        message: 'Service is alive',
        data: this.healthService.getLiveness(),
      }),
    );
  };

  readiness = async (_request, response) => {
    const readiness = this.healthService.getReadiness();
    response.status(readiness.status === 'ready' ? 200 : 503).json(
      successResponse({
        message: readiness.status === 'ready' ? 'Service is ready' : 'Service is not ready',
        data: readiness,
      }),
    );
  };
}
