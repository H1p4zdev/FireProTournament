import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/providers/language-provider';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);
  
  // Set active tab based on current path
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('home')) setActiveTab('home');
    else if (path.includes('tournaments')) setActiveTab('tournaments');
    else if (path.includes('wallet')) setActiveTab('wallet');
    else if (path.includes('leaderboard')) setActiveTab('leaderboard');
    else if (path.includes('profile')) setActiveTab('profile');
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* App Header */}
      <header className="bg-secondary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=40&h=40" 
            alt="BattleZone Logo" 
            className="w-8 h-8 rounded-full mr-2"
          />
          <h1 className="text-xl font-bold text-primary font-heading">{t('common.appName')}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-dark-light rounded-full px-3 py-1 flex items-center">
            <i className="ri-coins-line text-accent mr-1"></i>
            <span className="text-accent font-medium">{formatCurrency(user?.balance || 0)}</span>
          </div>
          
          <button id="notificationBtn" className="relative p-1">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-0 right-0 bg-destructive text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-16">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-gray-800 px-2 py-2">
        <div className="flex justify-around relative">
          <div 
            className="tab-indicator absolute h-1 bg-primary rounded-full bottom-0 transition-all duration-300" 
            style={{ 
              width: '20%', 
              left: activeTab === 'home' ? '0%' : 
                     activeTab === 'tournaments' ? '20%' : 
                     activeTab === 'wallet' ? '40%' : 
                     activeTab === 'leaderboard' ? '60%' : '80%' 
            }}
          ></div>
          
          <button 
            onClick={() => handleTabChange('home')} 
            className={`flex flex-col items-center py-1 px-3 relative ${activeTab === 'home' ? 'active' : ''}`}
          >
            <i className={`ri-home-5-line text-xl ${activeTab === 'home' ? 'text-primary' : 'text-gray-400'}`}></i>
            <span className={`text-xs mt-1 ${activeTab === 'home' ? 'text-primary' : 'text-gray-400'}`}>{t('tabs.home')}</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('tournaments')} 
            className={`flex flex-col items-center py-1 px-3 relative ${activeTab === 'tournaments' ? 'active' : ''}`}
          >
            <i className={`ri-trophy-line text-xl ${activeTab === 'tournaments' ? 'text-primary' : 'text-gray-400'}`}></i>
            <span className={`text-xs mt-1 ${activeTab === 'tournaments' ? 'text-primary' : 'text-gray-400'}`}>{t('tabs.tournaments')}</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('wallet')} 
            className={`flex flex-col items-center py-1 px-3 relative ${activeTab === 'wallet' ? 'active' : ''}`}
          >
            <i className={`ri-wallet-3-line text-xl ${activeTab === 'wallet' ? 'text-primary' : 'text-gray-400'}`}></i>
            <span className={`text-xs mt-1 ${activeTab === 'wallet' ? 'text-primary' : 'text-gray-400'}`}>{t('tabs.wallet')}</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('leaderboard')} 
            className={`flex flex-col items-center py-1 px-3 relative ${activeTab === 'leaderboard' ? 'active' : ''}`}
          >
            <i className={`ri-bar-chart-line text-xl ${activeTab === 'leaderboard' ? 'text-primary' : 'text-gray-400'}`}></i>
            <span className={`text-xs mt-1 ${activeTab === 'leaderboard' ? 'text-primary' : 'text-gray-400'}`}>{t('tabs.leaderboard')}</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('profile')} 
            className={`flex flex-col items-center py-1 px-3 relative ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <i className={`ri-user-line text-xl ${activeTab === 'profile' ? 'text-primary' : 'text-gray-400'}`}></i>
            <span className={`text-xs mt-1 ${activeTab === 'profile' ? 'text-primary' : 'text-gray-400'}`}>{t('tabs.profile')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
