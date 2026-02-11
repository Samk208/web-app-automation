
const HEADER = "x-correlation-id";

export function getCorrelationIdFromHeaders(headers: Headers): string {
    return headers.get(HEADER) || crypto.randomUUID();
}

export function withCorrelationHeader(headers: Headers, correlationId?: string) {
    if (correlationId) headers.set(HEADER, correlationId);
}

export const correlationHeader = HEADER;

