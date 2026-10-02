const CAUSE_DEPTH_LIMIT = 3;
const DESCRIPTION_LENGTH_LIMIT = 4_000;

/** Formats server errors without retaining cross-request state or serializing arbitrary payloads. */
export function describeError(error: unknown): string {
  if (!(error instanceof Error)) return "Unknown application error";
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < CAUSE_DEPTH_LIMIT && current instanceof Error; depth += 1) {
    const prefix = depth ? "caused by: " : "";
    parts.push(`${prefix}${current.name}: ${current.message}\n${current.stack ?? ""}`);
    current = current.cause;
  }
  return parts.join("\n").slice(0, DESCRIPTION_LENGTH_LIMIT);
}
