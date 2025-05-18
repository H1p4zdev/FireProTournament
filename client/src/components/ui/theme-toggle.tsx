import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { FC } from "react";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: FC<ThemeToggleProps> = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? (
        <i className="ri-sun-line text-xl"></i>
      ) : (
        <i className="ri-moon-line text-xl"></i>
      )}
    </Button>
  );
};

export default ThemeToggle;
