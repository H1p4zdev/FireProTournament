import { Tournament } from '@shared/schema';
import { useLanguage } from '@/providers/language-provider';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface TournamentCardProps {
  tournament: Tournament;
  isPast?: boolean;
}

export default function TournamentCard({ tournament, isPast = false }: TournamentCardProps) {
  const { t } = useLanguage();
  const { user, refreshUserData } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // Create a team for this tournament
      const response = await apiRequest('POST', '/api/teams', {
        name: `${user.nickname}'s Team`,
        captainId: user.id,
        tournamentId: tournament.id,
        teamType: tournament.tournamentType,
        members: [user.id]
      });
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: `You have successfully registered for ${tournament.title}`,
      });
      
      // Refresh user data to get updated balance
      refreshUserData();
      
      // Invalidate tournaments query to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for the tournament",
        variant: "destructive"
      });
    }
  });
  
  const handleRegister = () => {
    // Check if user has enough balance
    if (user && tournament.entryFee > 0 && (user.balance || 0) < tournament.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: "Please add funds to your wallet to register for this tournament",
        variant: "destructive"
      });
      return;
    }
    
    registerMutation.mutate();
  };
  
  const getTournamentTypeIcon = (type: string) => {
    switch (type) {
      case 'solo':
        return 'ri-user-line';
      case 'duo':
        return 'ri-team-line';
      case 'squad':
        return 'ri-team-line';
      default:
        return 'ri-user-line';
    }
  };
  
  const getTournamentTypeLabel = (type: string) => {
    switch (type) {
      case 'solo':
        return t('tournaments.solo');
      case 'duo':
        return t('tournaments.duo');
      case 'squad':
        return t('tournaments.squad');
      default:
        return type;
    }
  };
  
  return (
    <div className={cn("tournament-card bg-dark-light rounded-lg overflow-hidden", isPast && "opacity-75")}>
      <div className="relative h-28">
        <img 
          src={tournament.imageUrl || "https://images.unsplash.com/photo-1511512578047-dfb367046420"} 
          alt={tournament.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 bg-secondary bg-opacity-90 text-white text-xs px-2 py-1 m-2 rounded">
          <i className={`${getTournamentTypeIcon(tournament.tournamentType)} mr-1`}></i> {getTournamentTypeLabel(tournament.tournamentType)}
        </div>
        <div className={cn(
            "absolute top-0 right-0 text-white text-xs px-2 py-1 m-2 rounded",
            tournament.entryFee === 0 ? "bg-success bg-opacity-90" : "bg-primary bg-opacity-90",
            isPast && "bg-gray-500 bg-opacity-90"
          )}
        >
          {isPast ? (
            t('common.completed')
          ) : (
            tournament.entryFee === 0 ? (
              <><i className="ri-money-dollar-circle-line mr-1"></i> {t('common.free')}</>
            ) : (
              <><i className="ri-money-dollar-circle-line mr-1"></i> {formatCurrency(tournament.entryFee)}</>
            )
          )}
        </div>
        
        {tournament.status === 'live' && (
          <div className="absolute top-0 left-0 bg-destructive bg-opacity-90 text-white text-xs px-2 py-1 m-2 rounded flex items-center">
            <span className="w-2 h-2 bg-white rounded-full mr-1 pulse"></span> {t('common.live')}
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-bold text-white">{tournament.title}</h4>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center text-sm text-gray-300">
            <i className="ri-calendar-line mr-1"></i>
            <span>{formatDate(tournament.startTime)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <i className="ri-group-line mr-1"></i>
            <span>{tournament.registeredTeams}/{tournament.maxTeams}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div>
            <span className="text-accent font-medium">{t('common.prize')}: {formatCurrency(tournament.prizePool)}</span>
          </div>
          
          {isPast ? (
            <button className="bg-secondary text-white px-3 py-1 rounded-lg text-sm">
              {t('common.results')}
            </button>
          ) : tournament.status === 'live' ? (
            <button className="bg-dark-light border border-primary text-primary px-3 py-1 rounded-lg text-sm">
              {t('home.watch')}
            </button>
          ) : (
            <button 
              className="bg-primary text-white px-3 py-1 rounded-lg text-sm"
              onClick={handleRegister}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? t('common.loading') : t('common.register')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
