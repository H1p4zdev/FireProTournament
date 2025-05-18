import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { FC } from "react";

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: FC<LanguageToggleProps> = ({ className = "" }) => {
  const { currentLanguage, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className={className}
      aria-label={currentLanguage === "en" ? "Switch to Bangla" : "Switch to English"}
    >
      <i className="ri-translate-2 text-xl"></i>
    </Button>
  );
};

export default LanguageToggle;
