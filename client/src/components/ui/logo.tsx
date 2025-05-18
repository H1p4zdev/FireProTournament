import { FC } from "react";
import { useLanguage } from "@/hooks/use-language";

interface LogoProps {
  className?: string;
}

const Logo: FC<LogoProps> = ({ className = "" }) => {
  const { currentLanguage } = useLanguage();

  return (
    <div className={`text-xl font-bold font-poppins ${className}`}>
      <span className="text-primary">Fire</span>
      <span>{currentLanguage === "en" ? "Tourney" : "টুর্নি"}</span>
    </div>
  );
};

export default Logo;
