import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/index/")({
  head: () => ({
    meta: [
      { title: "TypeNova — Learn Touch Typing Free" },
      { name: "description", content: "Open TypeNova for guided lessons, timed tests, adaptive drills, and progress tracking." },
      { property: "og:title", content: "TypeNova — Learn Touch Typing Free" },
      { property: "og:description", content: "Guided lessons, timed tests, adaptive drills, and local progress tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndexRedirect,
});

function IndexRedirect() {
  return <Navigate to="/" replace />;
}
