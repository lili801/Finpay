import { Router } from 'express';

import { HealthController } from '../controllers/health.controller.js';
import { healthService } from '../services/health.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export function createHealthRouter() {
  const router = Router();
  const controller = new HealthController(healthService);

  router.get('/live', asyncHandler(controller.liveness));
  router.get('/ready', asyncHandler(controller.readiness));

  return router;
}
