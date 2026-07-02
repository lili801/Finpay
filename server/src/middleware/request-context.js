import { randomUUID } from 'node:crypto';

const REQUEST_ID_HEADER = 'x-request-id';

export function requestContext(request, response, next) {
  const incomingRequestId = request.get(REQUEST_ID_HEADER)?.trim();
  request.id = incomingRequestId || randomUUID();
  response.setHeader(REQUEST_ID_HEADER, request.id);
  next();
}
