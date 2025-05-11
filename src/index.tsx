import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import ReactDOM from "react-dom/client";

import "./styles.css";
import React from "react";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root") as Element;
const root = ReactDOM.createRoot(rootElement);
root.render(<RouterProvider router={router} />);
