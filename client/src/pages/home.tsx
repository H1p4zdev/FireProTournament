import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useModals } from "@/hooks/use-modal";
import { useAuth } from "@/hooks/use-auth";
import { useTournaments } from "@/hooks/use-tournament";
import TournamentCard from "@/components/ui/tournament-card";
import LeaderboardCard from "@/components/ui/leaderboard-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

const HomePage: FC = () => {
  const { t } = useLanguage();
  const { openLoginModal, openCreateTournamentModal } = useModals();
  const { user } = useAuth();
  
  // Fetch ongoing tournaments
  const { data: ongoingTournaments, isLoading: ongoingLoading } = useTournaments({ status: "live" });
  
  // Fetch upcoming tournaments
  const { data: upcomingTournaments, isLoading: upcomingLoading } = useTournaments({ status: "upcoming" });
  
  // Fetch top players
  const { data: topPlayers, isLoading: topPlayersLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <main className="pt-16 pb-20">
      <div className="p-4">
        {/* Hero Banner */}
        <div className="relative rounded-xl overflow-hidden mb-6">
          <img 
            src="https://images.unsplash.com/photo-1519326844852-704caea5679e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
            alt="Free Fire Tournament Banner" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h2 className="text-2xl font-bold font-poppins">
              <span>{t("play")}</span> <span className="text-primary">Free Fire</span><br />
              <span>{t("winRealMoney")}</span>
            </h2>
            {user ? (
              <Button 
                onClick={openCreateTournamentModal} 
                className="mt-3 flex items-center"
              >
                <i className="ri-trophy-line mr-2"></i>
                {t("createTournament")}
              </Button>
            ) : (
              <Button 
                onClick={openLoginModal} 
                className="mt-3 flex items-center"
              >
                <i className="ri-login-box-line mr-2"></i>
                {t("loginToPlay")}
              </Button>
            )}
          </div>
        </div>
        
        {/* Ongoing Tournaments */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold font-poppins">{t("ongoingTournaments")}</h3>
            <Link href="/tournaments" className="text-primary text-sm font-medium">
              {t("viewAll")}
            </Link>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex space-x-4">
              {ongoingLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="w-64 h-64 flex-shrink-0">
                    <Skeleton className="h-32 w-full" />
                    <div className="p-3">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-4 w-24 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-12 w-16" />
                        <Skeleton className="h-12 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : ongoingTournaments && ongoingTournaments.length > 0 ? (
                ongoingTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-10 text-muted-foreground">
                  <i className="ri-trophy-line text-4xl mb-2"></i>
                  <p>{t("noOngoingTournaments")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Upcoming Tournaments */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold font-poppins">{t("upcomingTournaments")}</h3>
            <Link href="/tournaments" className="text-primary text-sm font-medium">
              {t("viewAll")}
            </Link>
          </div>
          
          <div className="space-y-4">
            {upcomingLoading ? (
              // Loading skeletons
              Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <Skeleton className="w-full sm:w-32 h-32" />
                    <div className="p-3 flex-grow">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-4 w-32 mb-4" />
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-12 w-16" />
                        <Skeleton className="h-12 w-16" />
                        <Skeleton className="h-12 w-24" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : upcomingTournaments && upcomingTournaments.length > 0 ? (
              upcomingTournaments.slice(0, 2).map((tournament) => (
                <TournamentCard 
                  key={tournament.id} 
                  tournament={tournament} 
                  variant="horizontal"
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center w-full py-10 text-muted-foreground">
                <i className="ri-calendar-line text-4xl mb-2"></i>
                <p>{t("noUpcomingTournaments")}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Top Players */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold font-poppins">{t("topPlayers")}</h3>
            <Link href="/leaderboard" className="text-primary text-sm font-medium">
              {t("viewAll")}
            </Link>
          </div>
          
          <Card className="overflow-hidden shadow-md">
            <div className="p-4 space-y-3">
              {topPlayersLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded-full mr-2" />
                    <Skeleton className="w-10 h-10 rounded-full mr-3" />
                    <div className="flex-grow">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-5 w-8 mx-auto" />
                    </div>
                  </div>
                ))
              ) : topPlayers && topPlayers.length > 0 ? (
                topPlayers.slice(0, 3).map((player, index) => (
                  <LeaderboardCard 
                    key={player.id} 
                    user={{
                      ...player,
                      tournamentWins: 24 - index * 6 // Mock data for tournament wins
                    }}
                    rank={index + 1}
                    showTournamentWins={true}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-10 text-muted-foreground">
                  <i className="ri-user-star-line text-4xl mb-2"></i>
                  <p>{t("noTopPlayers")}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
