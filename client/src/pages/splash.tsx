import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/providers/language-provider';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Navigate to appropriate screen when loading is complete
  useEffect(() => {
    if (progress === 100 && !isLoading) {
      setTimeout(() => {
        if (isAuthenticated) {
          navigate('/home');
        } else {
          navigate('/auth');
        }
      }, 300);
    }
  }, [progress, isAuthenticated, isLoading, navigate]);
  
  return (
    <div className="fixed inset-0 bg-dark z-50 flex flex-col items-center justify-center">
      <img 
        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&h=400" 
        alt="BattleZone Logo" 
        className="w-40 h-40 mb-6 rounded-full pulse"
      />
      <h1 className="text-4xl font-bold text-primary font-heading mb-2">{t('common.appName')}</h1>
      <p className="text-light text-lg">{t('common.tagline')}</p>
      <div className="mt-8 w-48 h-2 bg-dark-light rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
