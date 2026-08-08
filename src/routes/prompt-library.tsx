import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/prompt-library")({
  component: () => <Outlet />,
});
