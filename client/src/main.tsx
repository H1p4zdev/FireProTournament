import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./providers/language-provider";
import { ThemeProvider } from "./providers/theme-provider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark">
    <LanguageProvider defaultLanguage="en">
      <App />
    </LanguageProvider>
  </ThemeProvider>
);
