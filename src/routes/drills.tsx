import { createFileRoute, redirect } from "@tanstack/react-router";

// Drills were renamed to Practice; keep old links working.
export const Route = createFileRoute("/drills")({
  beforeLoad: () => {
    throw redirect({ to: "/practice", statusCode: 301 });
  },
});
