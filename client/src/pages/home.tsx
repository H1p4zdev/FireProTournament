import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import TournamentCard from '@/components/tournament-card';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';
import { Tournament } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  // Fetch tournaments
  const { data: upcomingTournaments, isLoading: isLoadingUpcoming } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments', { status: 'upcoming' }],
  });
  
  const { data: liveTournaments, isLoading: isLoadingLive } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments', { status: 'live' }],
  });
  
  // Fetch leaderboard for recent winners
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['/api/leaderboard'],
  });
  
  return (
    <div className="p-4 space-y-6">
      {/* Language and Theme Toggle Bar */}
      <div className="flex justify-between items-center bg-dark-light rounded-lg p-3 mb-4">
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
        
        <div className="flex items-center">
          <i className="ri-sun-line mr-2"></i>
          <label className="relative inline-block w-12 h-6">
            <input 
              type="checkbox" 
              className="opacity-0 w-0 h-0"
              checked={theme === 'dark'}
              onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <span className="absolute cursor-pointer inset-0 rounded-full bg-secondary before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:left-1 before:bottom-1 before:transition-transform before:duration-300 before:ease-in-out before:content-[''] before:transform before:translate-x-0 before:translate-y-0 before:[input:checked+&]:bg-primary before:[input:checked+&]:translate-x-6"></span>
          </label>
          <i className="ri-moon-line ml-2"></i>
        </div>
      </div>
      
      {/* Featured Tournament Banner */}
      <div className="relative rounded-xl overflow-hidden h-48">
        <img 
          src="https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=800&h=400" 
          alt="Featured Tournament" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-xl font-heading text-shadow">Victory Royale Cup</h3>
              <p className="text-white text-shadow">{t('common.prize')}: {formatCurrency(10000)}</p>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium">{t('home.joinNow')}</button>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-dark-light rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">{t('home.totalTournaments')}</p>
          <p className="text-xl font-bold text-white">24</p>
        </div>
        <div className="bg-dark-light rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">{t('home.totalWinnings')}</p>
          <p className="text-xl font-bold text-accent">{formatCurrency(1500)}</p>
        </div>
        <div className="bg-dark-light rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">{t('common.rank')}</p>
          <p className="text-xl font-bold text-primary">#142</p>
        </div>
      </div>
      
      {/* Upcoming Tournaments */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold font-heading">{t('home.upcomingTournaments')}</h3>
          <a href="#" className="text-primary text-sm">{t('common.viewAll')}</a>
        </div>
        
        <div className="space-y-4">
          {isLoadingUpcoming ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : upcomingTournaments && upcomingTournaments.length > 0 ? (
            upcomingTournaments.slice(0, 2).map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))
          ) : (
            <div className="text-center py-4 text-gray-400">
              {t('common.noUpcomingTournaments')}
            </div>
          )}
        </div>
      </div>
      
      {/* Live Tournaments */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold font-heading">{t('home.liveTournaments')}</h3>
          <a href="#" className="text-primary text-sm">{t('common.viewAll')}</a>
        </div>
        
        <div className="space-y-4">
          {isLoadingLive ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : liveTournaments && liveTournaments.length > 0 ? (
            liveTournaments.map(tournament => (
              <div key={tournament.id} className="tournament-card bg-dark-light rounded-lg overflow-hidden">
                <div className="relative h-24">
                  <img 
                    src={tournament.imageUrl || "https://images.unsplash.com/photo-1605979257913-1704eb7b6246"} 
                    alt="Live Tournament" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-destructive bg-opacity-90 text-white text-xs px-2 py-1 m-2 rounded flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-1 pulse"></span> {t('common.live')}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-white">{tournament.title}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center text-sm text-gray-300">
                      <i className="ri-group-line mr-1"></i>
                      <span>{tournament.registeredTeams} {t('common.teams')}</span>
                    </div>
                    <button className="bg-dark-light border border-primary text-primary px-3 py-1 rounded-lg text-sm">{t('home.watch')}</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400">
              {t('common.noLiveTournaments')}
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Winners */}
      <div>
        <h3 className="text-lg font-bold font-heading mb-3">{t('home.recentWinners')}</h3>
        <div className="bg-dark-light rounded-lg p-3">
          {isLoadingLeaderboard ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1566753323558-f4e0952af115" 
                    alt="Winner" 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <p className="font-medium text-white">Team Phantom</p>
                    <p className="text-xs text-gray-400">Victory Royale Cup</p>
                  </div>
                </div>
                <div className="text-accent font-bold">{formatCurrency(8000)}</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" 
                    alt="Winner" 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <p className="font-medium text-white">SnipeKing</p>
                    <p className="text-xs text-gray-400">Solo Sniper Challenge</p>
                  </div>
                </div>
                <div className="text-accent font-bold">{formatCurrency(2000)}</div>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-400">
              {t('common.noRecentWinners')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
