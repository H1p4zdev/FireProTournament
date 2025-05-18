import { FC, useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: FC<CountdownTimerProps> = ({ targetDate, onComplete }) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onComplete) onComplete();
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };
    
    // Calculate immediately
    calculateTimeLeft();
    
    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  // Format the numbers to have leading zeros
  const formatNumber = (num: number) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div className="p-2 rounded bg-background">
        <div className="text-2xl font-bold font-rajdhani">{formatNumber(timeLeft.days)}</div>
        <div className="text-xs text-muted-foreground">{t("days")}</div>
      </div>
      <div className="p-2 rounded bg-background">
        <div className="text-2xl font-bold font-rajdhani">{formatNumber(timeLeft.hours)}</div>
        <div className="text-xs text-muted-foreground">{t("hours")}</div>
      </div>
      <div className="p-2 rounded bg-background">
        <div className="text-2xl font-bold font-rajdhani">{formatNumber(timeLeft.minutes)}</div>
        <div className="text-xs text-muted-foreground">{t("minutes")}</div>
      </div>
      <div className="p-2 rounded bg-background">
        <div className="text-2xl font-bold font-rajdhani">{formatNumber(timeLeft.seconds)}</div>
        <div className="text-xs text-muted-foreground">{t("seconds")}</div>
      </div>
    </div>
  );
};

export default CountdownTimer;
