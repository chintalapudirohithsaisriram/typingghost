type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: { mechanism: string; handled: boolean; severity: string },
  ) => void;
};
declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
    __lovableReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
  }
}
/** Deliberately exclude input, exception text, URLs, stacks and arbitrary context. */
export function reportLovableError(_error: unknown, _context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const message = "TypeNova could not render this page";
  window.__lovableEvents?.captureException?.(
    new Error(message),
    { source: "react_error_boundary" },
    { mechanism: "react_error_boundary", handled: true, severity: "error" },
  );
  window.__lovableReportRuntimeError?.({ message });
}
