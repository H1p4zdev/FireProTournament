import { useState } from 'react';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function Profile() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Fetch leaderboard data to get user stats
  const { data: userLeaderboard } = useQuery({
    queryKey: ['/api/users', user?.id, 'leaderboard'],
    enabled: !!user?.id,
  });
  
  // Format join date
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }) : 'August 2023';
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-secondary to-primary"></div>
        <div className="absolute top-16 left-0 w-full px-4 flex flex-col items-center">
          <div className="relative">
            <img 
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1566753323558-f4e0952af115"} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-dark"
            />
            <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2">
              <i className="ri-camera-line"></i>
            </button>
          </div>
          <h2 className="text-xl font-bold mt-2">{user?.nickname}</h2>
          <p className="text-gray-400 text-sm">{t('profile.joinedDate')}: {joinDate}</p>
          
          <div className="flex space-x-4 mt-2">
            <div className="text-center">
              <p className="text-gray-400 text-xs">{t('common.tournaments')}</p>
              <p className="font-bold">{userLeaderboard?.totalTournaments || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">{t('common.wins')}</p>
              <p className="font-bold">{userLeaderboard?.wins || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">{t('wallet.totalBalance')}</p>
              <p className="font-bold text-accent">{formatCurrency(user?.balance || 0)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Details */}
      <div className="mt-32 px-4">
        <div className="bg-dark-light rounded-lg p-4">
          <h3 className="text-lg font-bold font-heading mb-3">{t('profile.gameDetails')}</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-gray-400">{t('profile.freeFireUID')}</p>
              <p className="font-medium">{user?.freeFireUID || "123456789"}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-400">{t('profile.level')}</p>
              <p className="font-medium">42</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-400">{t('profile.kdRatio')}</p>
              <p className="font-medium">2.5</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-400">{t('common.rank')}</p>
              <div className="flex items-center">
                <span className="mr-1">Diamond</span>
                <i className="ri-award-fill text-blue-400"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Settings */}
      <div className="px-4">
        <div className="bg-dark-light rounded-lg p-4">
          <h3 className="text-lg font-bold font-heading mb-3">{t('profile.settings')}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-notification-3-line mr-2"></i>
                <p>{t('profile.notifications')}</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input 
                  type="checkbox" 
                  className="opacity-0 w-0 h-0"
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                />
                <span className="absolute cursor-pointer inset-0 rounded-full bg-secondary before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:left-1 before:bottom-1 before:transition-transform before:duration-300 before:ease-in-out before:content-[''] before:transform before:translate-x-0 before:translate-y-0 before:[input:checked+&]:bg-primary before:[input:checked+&]:translate-x-6"></span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-moon-line mr-2"></i>
                <p>{t('profile.darkMode')}</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input 
                  type="checkbox" 
                  className="opacity-0 w-0 h-0"
                  checked={theme === 'dark'}
                  onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                />
                <span className="absolute cursor-pointer inset-0 rounded-full bg-secondary before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:left-1 before:bottom-1 before:transition-transform before:duration-300 before:ease-in-out before:content-[''] before:transform before:translate-x-0 before:translate-y-0 before:[input:checked+&]:bg-primary before:[input:checked+&]:translate-x-6"></span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-global-line mr-2"></i>
                <p>{t('profile.language')}</p>
              </div>
              <div className="flex items-center">
                <span className="mr-2">EN</span>
                <label className="relative inline-block w-12 h-6">
                  <input 
                    type="checkbox" 
                    className="opacity-0 w-0 h-0"
                    checked={language === 'bn'}
                    onChange={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                  />
                  <span className="absolute cursor-pointer inset-0 rounded-full bg-secondary before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:left-1 before:bottom-1 before:transition-transform before:duration-300 before:ease-in-out before:content-[''] before:transform before:translate-x-0 before:translate-y-0 before:[input:checked+&]:bg-primary before:[input:checked+&]:translate-x-6"></span>
                </label>
                <span className="ml-2">বাং</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="px-4 pb-6">
        <div className="space-y-3">
          <button className="w-full py-3 bg-dark-light text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center">
            <i className="ri-customer-service-2-line mr-2"></i> {t('profile.support')}
          </button>
          
          <button className="w-full py-3 bg-dark-light text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center">
            <i className="ri-share-line mr-2"></i> {t('profile.inviteFriends')}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full py-3 bg-destructive text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center"
          >
            <i className="ri-logout-box-line mr-2"></i> {t('common.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
