import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useWallet } from "@/hooks/use-wallet";
import { useModals } from "@/hooks/use-modal";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const mockAchievements: Achievement[] = [
  {
    id: "tournament-winner",
    name: "tournamentWinner",
    icon: "ri-trophy-line",
    color: "bg-yellow-500 bg-opacity-20 text-yellow-500"
  },
  {
    id: "kill-master",
    name: "killMaster",
    icon: "ri-sword-line",
    color: "bg-purple-500 bg-opacity-20 text-purple-500"
  },
  {
    id: "team-leader",
    name: "teamLeader",
    icon: "ri-team-line",
    color: "bg-blue-500 bg-opacity-20 text-blue-500"
  },
  {
    id: "regular-player",
    name: "regularPlayer",
    icon: "ri-calendar-check-line",
    color: "bg-green-500 bg-opacity-20 text-green-500"
  }
];

const mockTournamentHistory = [
  {
    id: 1,
    name: "Weekend Warrior Cup",
    date: "Oct 15, 2023",
    position: "1st",
    prize: 5000,
    isWinner: true
  },
  {
    id: 2,
    name: "Squad Battle",
    date: "Oct 8, 2023",
    position: "5th",
    prize: 500,
    isWinner: false
  },
  {
    id: 3,
    name: "Solo Showdown",
    date: "Oct 1, 2023",
    position: "2nd",
    prize: 1500,
    isWinner: true
  }
];

const ProfilePage: FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { transactions } = useWallet();
  const { openLoginModal } = useModals();
  const { toast } = useToast();
  const [referralCode] = useState("GAMERX25");

  if (!user) {
    return (
      <main className="pt-16 pb-20">
        <div className="p-4 flex flex-col items-center justify-center h-[70vh]">
          <i className="ri-user-line text-5xl mb-4 text-muted-foreground"></i>
          <h3 className="text-xl font-bold mb-4">{t("loginToViewProfile")}</h3>
          <Button onClick={openLoginModal}>
            <i className="ri-login-box-line mr-2"></i>
            {t("login")}
          </Button>
        </div>
      </main>
    );
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: t("codeCopied"),
      description: t("referralCodeCopied"),
    });
  };

  return (
    <main className="pt-16 pb-20">
      <div className="p-4">
        {/* User Profile */}
        <div className="mb-6">
          <Card className="overflow-hidden shadow-md">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row items-center">
                <Avatar className="w-24 h-24 border-4 border-primary">
                  <AvatarImage src={user.avatar} alt={user.displayName} />
                  <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
                  <h3 className="text-xl font-bold">{user.displayName}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    <span className="text-xs bg-primary bg-opacity-20 text-primary rounded-full px-2 py-0.5 flex items-center">
                      <i className="ri-trophy-line mr-1"></i> 7 {t("tournamentsWon")}
                    </span>
                    <span className="text-xs bg-primary bg-opacity-20 text-primary rounded-full px-2 py-0.5 flex items-center">
                      <i className="ri-arrow-up-line mr-1"></i> {t("rank")} 25
                    </span>
                    <span className="text-xs bg-muted rounded-full px-2 py-0.5 flex items-center">
                      <i className="ri-gamepad-line mr-1"></i> UID: {user.freeFireUid}
                    </span>
                  </div>
                </div>
                <div className="ml-0 sm:ml-auto mt-4 sm:mt-0">
                  <Button variant="outline" className="border-primary text-primary">
                    <i className="ri-edit-line mr-1"></i>
                    {t("editProfile")}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-muted-foreground text-sm">{t("matches")}</div>
                  <div className="text-2xl font-bold font-rajdhani">125</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-muted-foreground text-sm">{t("kills")}</div>
                  <div className="text-2xl font-bold font-rajdhani">450</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-muted-foreground text-sm">{t("kdRatio")}</div>
                  <div className="text-2xl font-bold font-rajdhani">3.6</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* My Tournaments */}
        <div className="mb-6">
          <h3 className="text-xl font-bold font-poppins mb-4">{t("myTournaments")}</h3>
          <Card className="overflow-hidden shadow-md">
            <div className="p-4 space-y-4">
              {mockTournamentHistory.map((tournament) => (
                <div 
                  key={tournament.id} 
                  className="flex justify-between items-center pb-3 border-b border-border"
                >
                  <div>
                    <h4 className="font-medium">{tournament.name}</h4>
                    <div className="text-xs text-muted-foreground">{tournament.date}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">{t("position")}</div>
                    <div className={`font-bold ${tournament.isWinner ? "text-success" : ""}`}>
                      {tournament.position}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">{t("prize")}</div>
                    <div className="font-bold font-rajdhani">৳{tournament.prize}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Achievements */}
        <div className="mb-6">
          <h3 className="text-xl font-bold font-poppins mb-4">{t("achievements")}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {mockAchievements.map((achievement) => (
              <Card key={achievement.id} className="p-3 text-center">
                <div className={`w-12 h-12 mx-auto flex items-center justify-center rounded-full ${achievement.color}`}>
                  <i className={`${achievement.icon} text-xl`}></i>
                </div>
                <div className="mt-2 text-sm font-medium">{t(achievement.name)}</div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Referrals */}
        <div className="mb-6">
          <h3 className="text-xl font-bold font-poppins mb-4">{t("referrals")}</h3>
          <Card className="overflow-hidden shadow-md">
            <div className="p-4">
              <div className="mb-4">
                <div className="text-sm mb-2">{t("yourReferralCode")}</div>
                <div className="flex">
                  <div className="flex-grow px-4 py-2 rounded-l-lg border-r-0 font-mono font-medium bg-muted border border-border">
                    {referralCode}
                  </div>
                  <Button 
                    onClick={copyReferralCode}
                    className="rounded-l-none"
                  >
                    {t("copy")}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-muted-foreground text-sm">{t("referrals")}</div>
                  <div className="text-2xl font-bold font-rajdhani">12</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-muted-foreground text-sm">{t("earnings")}</div>
                  <div className="text-2xl font-bold font-rajdhani">৳600</div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <i className="ri-share-line mr-2"></i>
                {t("shareReferralCode")}
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Recent Transactions */}
        <div className="mb-6">
          <h3 className="text-xl font-bold font-poppins mb-4">{t("recentTransactions")}</h3>
          <Card className="overflow-hidden shadow-md">
            <div className="p-4 space-y-3">
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between py-2 border-b border-border"
                  >
                    <div>
                      <div className="font-medium">
                        {transaction.type === "deposit" && t("addedViaBkash")}
                        {transaction.type === "withdrawal" && t("withdrawal")}
                        {transaction.type === "tournament_entry" && t("tournamentEntry")}
                        {transaction.type === "prize_money" && t("prizeMoney")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={transaction.type === "deposit" || transaction.type === "prize_money" ? "text-success font-medium" : "text-destructive font-medium"}>
                      {transaction.type === "deposit" || transaction.type === "prize_money" ? "+" : "-"}
                      ৳{transaction.amount}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {t("noTransactions")}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
