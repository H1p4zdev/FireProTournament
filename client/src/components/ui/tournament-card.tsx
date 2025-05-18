import { FC } from "react";
import { Tournament } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { useModals } from "@/hooks/use-modal";
import { Button } from "./button";
import { Card } from "./card";
import { formatDistanceToNow } from "date-fns";

interface TournamentCardProps {
  tournament: Tournament;
  variant?: "compact" | "horizontal";
}

const TournamentCard: FC<TournamentCardProps> = ({ 
  tournament,
  variant = "compact"
}) => {
  const { t } = useLanguage();
  const { openTournamentDetail } = useModals();
  
  // Format the timestamp to relative time (e.g. "2 days from now")
  const formatStartTime = (date: Date) => {
    const now = new Date();
    const tournamentDate = new Date(date);
    
    if (tournamentDate < now) {
      return t("inProgress");
    }
    
    return formatDistanceToNow(tournamentDate, { addSuffix: true });
  };
  
  const getBadgeText = () => {
    switch (tournament.status) {
      case "live":
        return "LIVE";
      case "upcoming":
        return t("upcoming");
      case "completed":
        return t("completed");
      default:
        return "";
    }
  };
  
  const getBadgeColor = () => {
    switch (tournament.status) {
      case "live":
        return "bg-primary bg-opacity-20 text-primary";
      case "upcoming":
        return "bg-warning bg-opacity-20 text-warning";
      case "completed":
        return "bg-gray-500 bg-opacity-20 text-gray-400";
      default:
        return "";
    }
  };
  
  const handleClick = () => {
    openTournamentDetail(tournament);
  };
  
  if (variant === "horizontal") {
    return (
      <Card className="overflow-hidden shadow-md cursor-pointer" onClick={handleClick}>
        <div className="flex flex-col sm:flex-row">
          <img 
            src={`https://source.unsplash.com/random/320x180/?esports,gaming&sig=${tournament.id}`} 
            alt={tournament.name} 
            className="w-full sm:w-32 h-32 object-cover"
          />
          <div className="p-3 flex-grow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getBadgeColor()}`}>
                  {getBadgeText()}
                </span>
                <h4 className="font-bold mt-1">{tournament.name}</h4>
              </div>
              <div className="text-xs text-muted-foreground">
                {tournament.registeredTeams}/{tournament.maxTeams}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs bg-gray-700 bg-opacity-50 rounded-full px-2 py-0.5">
                {tournament.type}
              </span>
              <span className="text-xs bg-gray-700 bg-opacity-50 rounded-full px-2 py-0.5">
                {tournament.map}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div>
                <div className="text-muted-foreground">{t("prizePool")}</div>
                <div className="font-bold font-rajdhani">৳{tournament.prizePool.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t("entry")}</div>
                <div className="font-bold font-rajdhani">৳{tournament.entryFee}</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t("starts")}</div>
                <div className="font-medium text-xs">
                  {new Date(tournament.startTime).toLocaleDateString()} {new Date(tournament.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <Button variant="default" size="sm" className="px-3 py-1 text-xs">
                {tournament.status === "upcoming" ? t("register") : t("join")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="w-64 rounded-xl overflow-hidden shadow-md flex-shrink-0 cursor-pointer" onClick={handleClick}>
      <img 
        src={`https://source.unsplash.com/random/320x180/?esports,gaming&sig=${tournament.id}`} 
        alt={tournament.name}
        className="w-full h-32 object-cover"
      />
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getBadgeColor()}`}>
              {getBadgeText()}
            </span>
            <h4 className="font-bold mt-1">{tournament.name}</h4>
          </div>
          <div className="text-xs text-muted-foreground">
            {tournament.registeredTeams}/{tournament.maxTeams}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div>
            <div className="text-muted-foreground">{t("prizePool")}</div>
            <div className="font-bold font-rajdhani">৳{tournament.prizePool.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("entry")}</div>
            <div className="font-bold font-rajdhani">৳{tournament.entryFee}</div>
          </div>
          <Button variant="default" size="sm" className="px-3 py-1 text-xs">
            {tournament.status === "upcoming" ? t("register") : t("join")}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TournamentCard;
