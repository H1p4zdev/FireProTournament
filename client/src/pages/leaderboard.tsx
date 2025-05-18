import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/providers/language-provider';
import { useAuth } from '@/hooks/use-auth';

interface LeaderboardUser {
  id: number;
  nickname: string;
  avatarUrl: string | null;
}

interface LeaderboardEntry {
  id: number;
  userId: number;
  points: number;
  wins: number;
  totalTournaments: number;
  weeklyPoints: number;
  monthlyPoints: number;
  user: LeaderboardUser | null;
}

export default function Leaderboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [leaderboardType, setLeaderboardType] = useState<string>('overall');
  
  // Fetch leaderboard data
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard', { type: leaderboardType }],
  });
  
  // Fetch user's leaderboard entry
  const { data: userLeaderboard, isLoading: isLoadingUserData } = useQuery<LeaderboardEntry>({
    queryKey: ['/api/users', user?.id, 'leaderboard'],
    enabled: !!user?.id,
  });
  
  // Find user's rank
  const userRank = leaderboard?.findIndex(entry => entry.userId === user?.id) ?? -1;
  
  return (
    <div className="p-4 space-y-6">
      {/* Leaderboard Categories */}
      <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar pb-2">
        <button 
          onClick={() => setLeaderboardType('overall')}
          className={`${leaderboardType === 'overall' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          {t('leaderboard.overall')}
        </button>
        <button 
          onClick={() => setLeaderboardType('weekly')}
          className={`${leaderboardType === 'weekly' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          {t('leaderboard.weekly')}
        </button>
        <button 
          onClick={() => setLeaderboardType('monthly')}
          className={`${leaderboardType === 'monthly' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          {t('leaderboard.monthly')}
        </button>
        <button 
          onClick={() => setLeaderboardType('tournament')}
          className={`${leaderboardType === 'tournament' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          {t('leaderboard.tournament')}
        </button>
      </div>
      
      {/* Your Ranking */}
      <div className="bg-secondary rounded-lg p-4">
        <h3 className="text-lg font-bold font-heading mb-3">{t('leaderboard.yourRanking')}</h3>
        {isLoadingUserData ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : userLeaderboard ? (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">
              {userRank !== -1 ? userRank + 1 : '?'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{user?.nickname}</p>
              <div className="w-full bg-dark-light rounded-full h-2 mt-1">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min(userLeaderboard.points / 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-accent font-bold">
                {leaderboardType === 'weekly' 
                  ? userLeaderboard.weeklyPoints 
                  : leaderboardType === 'monthly' 
                    ? userLeaderboard.monthlyPoints 
                    : userLeaderboard.points} pts
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            {t('leaderboard.noRankingData')}
          </div>
        )}
      </div>
      
      {/* Top Players */}
      <div>
        <h3 className="text-lg font-bold font-heading mb-3">{t('leaderboard.topPlayers')}</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="bg-dark-light rounded-lg">
            {/* Top 3 with special styling */}
            {leaderboard.length > 0 && (
              <div className="p-4 flex items-center bg-gradient-to-r from-accent to-amber-600 rounded-t-lg">
                <div className="w-8 h-8 rounded-full bg-white text-amber-600 flex items-center justify-center font-bold mr-3">
                  1
                </div>
                <div className="flex-1 flex items-center">
                  <img 
                    src={leaderboard[0].user?.avatarUrl || "https://images.unsplash.com/photo-1566753323558-f4e0952af115"} 
                    alt="Top Player" 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <p className="font-bold text-white">{leaderboard[0].user?.nickname}</p>
                </div>
                <div>
                  <p className="text-white font-bold">
                    {leaderboardType === 'weekly' 
                      ? leaderboard[0].weeklyPoints 
                      : leaderboardType === 'monthly' 
                        ? leaderboard[0].monthlyPoints 
                        : leaderboard[0].points} pts
                  </p>
                </div>
              </div>
            )}
            
            {leaderboard.length > 1 && (
              <div className="p-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-800 flex items-center justify-center font-bold mr-3">
                  2
                </div>
                <div className="flex-1 flex items-center">
                  <img 
                    src={leaderboard[1].user?.avatarUrl || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61"} 
                    alt="Second Place" 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <p className="font-medium text-white">{leaderboard[1].user?.nickname}</p>
                </div>
                <div>
                  <p className="text-accent font-bold">
                    {leaderboardType === 'weekly' 
                      ? leaderboard[1].weeklyPoints 
                      : leaderboardType === 'monthly' 
                        ? leaderboard[1].monthlyPoints 
                        : leaderboard[1].points} pts
                  </p>
                </div>
              </div>
            )}
            
            {leaderboard.length > 2 && (
              <div className="p-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold mr-3">
                  3
                </div>
                <div className="flex-1 flex items-center">
                  <img 
                    src={leaderboard[2].user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} 
                    alt="Third Place" 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <p className="font-medium text-white">{leaderboard[2].user?.nickname}</p>
                </div>
                <div>
                  <p className="text-accent font-bold">
                    {leaderboardType === 'weekly' 
                      ? leaderboard[2].weeklyPoints 
                      : leaderboardType === 'monthly' 
                        ? leaderboard[2].monthlyPoints 
                        : leaderboard[2].points} pts
                  </p>
                </div>
              </div>
            )}
            
            {/* Rest of the leaderboard */}
            {leaderboard.slice(3).map((entry, index) => (
              <div key={entry.id} className="p-4 flex items-center border-t border-gray-700">
                <div className="w-8 h-8 rounded-full bg-dark-light text-gray-400 flex items-center justify-center font-medium mr-3">
                  {index + 4}
                </div>
                <div className="flex-1 flex items-center">
                  <img 
                    src={entry.user?.avatarUrl || `https://images.unsplash.com/photo-1527980965255-d3b416303d12`} 
                    alt="Player" 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <p className="font-medium text-white">{entry.user?.nickname}</p>
                </div>
                <div>
                  <p className="text-accent font-medium">
                    {leaderboardType === 'weekly' 
                      ? entry.weeklyPoints 
                      : leaderboardType === 'monthly' 
                        ? entry.monthlyPoints 
                        : entry.points} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-dark-light rounded-lg p-8 text-center text-gray-400">
            {t('leaderboard.noLeaderboardData')}
          </div>
        )}
      </div>
    </div>
  );
}
