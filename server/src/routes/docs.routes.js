import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import { openApiSpecification } from '../docs/openapi.js';

export function createDocsRouter() {
  const router = Router();

  router.get('/openapi.json', (_request, response) => {
    response.status(200).json(openApiSpecification);
  });
  router.use('/', swaggerUi.serve, swaggerUi.setup(openApiSpecification));

  return router;
}
