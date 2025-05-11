import { Button } from "@/components/shadcn/Button";
import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="h-full flex items-center justify-center">
      <Button>
        <Link to="/builder">Get started</Link>
      </Button>
    </div>
  );
}
