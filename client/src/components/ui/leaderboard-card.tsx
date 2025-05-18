import { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export interface LeaderboardUser {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  freeFireUid: string;
  walletBalance: number;
  tournamentWins?: number;
}

interface LeaderboardCardProps {
  user: LeaderboardUser;
  rank: number;
  showTournamentWins?: boolean;
}

const LeaderboardCard: FC<LeaderboardCardProps> = ({
  user,
  rank,
  showTournamentWins = false,
}) => {
  const getRankClass = () => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-yellow-700 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex items-center">
      <div className="w-8 h-8 flex items-center justify-center font-bold font-rajdhani">
        {rank}
      </div>
      <Avatar className="w-10 h-10 overflow-hidden">
        <AvatarImage src={user.avatar} alt={user.displayName} />
        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="ml-3 flex-grow">
        <div className="font-medium">{user.displayName}</div>
        <div className="text-xs text-muted-foreground">UID: {user.freeFireUid}</div>
      </div>
      <div className="text-center">
        {showTournamentWins ? (
          <>
            <div className="text-xs text-muted-foreground">Tournaments Won</div>
            <div className="font-bold font-rajdhani">{user.tournamentWins || 0}</div>
          </>
        ) : (
          <div className="font-bold font-rajdhani">
            {user.walletBalance.toLocaleString()} pts
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardCard;
