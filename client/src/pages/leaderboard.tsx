import { FC, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import LeaderboardCard from "@/components/ui/leaderboard-card";

const LeaderboardPage: FC = () => {
  const { t } = useLanguage();
  const [timePeriod, setTimePeriod] = useState("week");
  
  // Fetch leaderboard data
  const { data: players, isLoading } = useQuery({
    queryKey: [`/api/leaderboard?timeperiod=${timePeriod}`],
  });
  
  const topThreePlayers = players ? players.slice(0, 3) : [];
  const otherPlayers = players ? players.slice(3) : [];

  return (
    <main className="pt-16 pb-20">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-poppins">{t("leaderboard")}</h2>
          <Select onValueChange={setTimePeriod} defaultValue="week">
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t("thisWeek")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t("thisWeek")}</SelectItem>
              <SelectItem value="month">{t("thisMonth")}</SelectItem>
              <SelectItem value="all">{t("allTime")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          // Loading skeleton for top 3
          <div className="flex justify-center items-end mb-10 gap-4">
            {[2, 1, 3].map((position) => (
              <div key={position} className="flex flex-col items-center">
                <Skeleton className={`
                  rounded-full 
                  ${position === 1 ? 'w-20 h-20 border-2 border-yellow-500' : 'w-16 h-16 border-2 border-gray-400'}
                `} />
                <Skeleton className={`
                  w-8 h-8 rounded-full -mt-3
                  ${position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-400' : 'bg-yellow-700'}
                `} />
                <div className="text-center mt-2">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className={`
                  rounded-t-lg mt-3 w-16
                  ${position === 1 ? 'h-32' : position === 2 ? 'h-24' : 'h-16'}
                `} />
              </div>
            ))}
          </div>
        ) : topThreePlayers.length > 0 ? (
          // Top 3 Players
          <div className="flex justify-center items-end mb-10 gap-4">
            {/* 2nd Place */}
            {topThreePlayers.length > 1 && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-400">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={topThreePlayers[1].avatar} alt={topThreePlayers[1].displayName} />
                    <AvatarFallback>{topThreePlayers[1].displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="w-8 h-8 flex items-center justify-center bg-gray-400 text-white rounded-full -mt-3 font-bold">2</div>
                <div className="text-center mt-2">
                  <div className="font-medium">{topThreePlayers[1].displayName}</div>
                  <div className="text-sm text-muted-foreground">{topThreePlayers[1].tournamentWins || 18} Wins</div>
                  <div className="font-bold font-rajdhani">{topThreePlayers[1].walletBalance} pts</div>
                </div>
                <div className="h-24 w-16 rounded-t-lg mt-3 bg-muted"></div>
              </div>
            )}
            
            {/* 1st Place */}
            {topThreePlayers.length > 0 && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-500">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={topThreePlayers[0].avatar} alt={topThreePlayers[0].displayName} />
                    <AvatarFallback>{topThreePlayers[0].displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white rounded-full -mt-3 font-bold">1</div>
                <div className="text-center mt-2">
                  <div className="font-medium">{topThreePlayers[0].displayName}</div>
                  <div className="text-sm text-muted-foreground">{topThreePlayers[0].tournamentWins || 24} Wins</div>
                  <div className="font-bold font-rajdhani">{topThreePlayers[0].walletBalance} pts</div>
                </div>
                <div className="h-32 w-16 rounded-t-lg mt-3 bg-gradient-to-b from-yellow-500 to-yellow-600"></div>
              </div>
            )}
            
            {/* 3rd Place */}
            {topThreePlayers.length > 2 && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-700">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={topThreePlayers[2].avatar} alt={topThreePlayers[2].displayName} />
                    <AvatarFallback>{topThreePlayers[2].displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="w-8 h-8 flex items-center justify-center bg-yellow-700 text-white rounded-full -mt-3 font-bold">3</div>
                <div className="text-center mt-2">
                  <div className="font-medium">{topThreePlayers[2].displayName}</div>
                  <div className="text-sm text-muted-foreground">{topThreePlayers[2].tournamentWins || 15} Wins</div>
                  <div className="font-bold font-rajdhani">{topThreePlayers[2].walletBalance} pts</div>
                </div>
                <div className="h-16 w-16 rounded-t-lg mt-3 bg-muted"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-10 text-muted-foreground mb-10">
            <i className="ri-trophy-line text-4xl mb-2"></i>
            <p>{t("noLeaderboardData")}</p>
          </div>
        )}
        
        {/* Leaderboard List */}
        <Card className="overflow-hidden shadow-md">
          <div className="p-4 space-y-4">
            {isLoading ? (
              // Loading skeletons for other players
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full mr-2" />
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-grow">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))
            ) : otherPlayers && otherPlayers.length > 0 ? (
              otherPlayers.map((player, index) => (
                <LeaderboardCard 
                  key={player.id} 
                  user={player}
                  rank={index + 4} // Ranks start at 4 for this list
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center w-full py-10 text-muted-foreground">
                <p>{t("noOtherPlayers")}</p>
              </div>
            )}
          </div>
        </Card>
        
        {otherPlayers && otherPlayers.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              className="flex items-center justify-center space-x-2"
            >
              <span>{t("loadMore")}</span>
              <i className="ri-arrow-down-line"></i>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default LeaderboardPage;
