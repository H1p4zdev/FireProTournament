import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./providers/language-provider";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider defaultLanguage="en">
        <App />
      </LanguageProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
