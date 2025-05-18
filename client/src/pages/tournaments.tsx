import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import TournamentCard from '@/components/tournament-card';
import { useLanguage } from '@/providers/language-provider';
import { Tournament } from '@shared/schema';

export default function Tournaments() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Fetch tournaments
  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });
  
  const filteredTournaments = tournaments?.filter(tournament => {
    // Filter by search term
    const matchesSearch = tournament.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === 'all' || 
                           (categoryFilter === 'solo' && tournament.tournamentType === 'solo') ||
                           (categoryFilter === 'duo' && tournament.tournamentType === 'duo') ||
                           (categoryFilter === 'squad' && tournament.tournamentType === 'squad') ||
                           (categoryFilter === 'free' && tournament.entryFee === 0) ||
                           (categoryFilter === 'premium' && tournament.entryFee > 0);
    
    return matchesSearch && matchesCategory;
  });
  
  const upcomingTournaments = filteredTournaments?.filter(t => t.status !== 'completed');
  const pastTournaments = filteredTournaments?.filter(t => t.status === 'completed');
  
  return (
    <div className="p-4 space-y-6">
      {/* Tournament Categories */}
      <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar pb-2">
        <button 
          onClick={() => setCategoryFilter('all')}
          className={`${categoryFilter === 'all' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          {t('tournaments.all')}
        </button>
        <button 
          onClick={() => setCategoryFilter('solo')}
          className={`${categoryFilter === 'solo' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          {t('tournaments.solo')}
        </button>
        <button 
          onClick={() => setCategoryFilter('duo')}
          className={`${categoryFilter === 'duo' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          {t('tournaments.duo')}
        </button>
        <button 
          onClick={() => setCategoryFilter('squad')}
          className={`${categoryFilter === 'squad' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          {t('tournaments.squad')}
        </button>
        <button 
          onClick={() => setCategoryFilter('free')}
          className={`${categoryFilter === 'free' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          {t('tournaments.freeEntry')}
        </button>
        <button 
          onClick={() => setCategoryFilter('premium')}
          className={`${categoryFilter === 'premium' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          {t('tournaments.premium')}
        </button>
      </div>
      
      {/* Tournament Search */}
      <div className="relative">
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('tournaments.searchPlaceholder')} 
          className="w-full bg-dark-light border border-gray-700 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-primary"
        />
        <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
      
      {/* Tournament Listings */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold font-heading">{t('tournaments.upcomingTournaments')}</h3>
            
            {upcomingTournaments && upcomingTournaments.length > 0 ? (
              <div className="space-y-4">
                {upcomingTournaments.map(tournament => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                {t('common.noUpcomingTournaments')}
              </div>
            )}
            
            <h3 className="text-lg font-bold font-heading mt-6">{t('tournaments.pastTournaments')}</h3>
            
            {pastTournaments && pastTournaments.length > 0 ? (
              <div className="space-y-4">
                {pastTournaments.map(tournament => (
                  <TournamentCard key={tournament.id} tournament={tournament} isPast={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                {t('common.noPastTournaments')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
