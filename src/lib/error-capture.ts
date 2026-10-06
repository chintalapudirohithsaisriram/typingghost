/** Formats server errors without retaining cross-request state or serializing arbitrary payloads. */
export function describeError(error: unknown): string {
  return error instanceof Error ? "Application error during request handling" : "Unknown application error";
}
