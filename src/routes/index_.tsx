import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/index")({
  head: () => ({
    meta: [
      { title: "TypeNova — Learn Touch Typing Free" },
      { name: "description", content: "Open the TypeNova home page for lessons, tests, drills, and progress tracking." },
      { property: "og:title", content: "TypeNova — Learn Touch Typing Free" },
      { property: "og:description", content: "Open the TypeNova home page for lessons, tests, drills, and progress tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Navigate to="/" replace />,
});
