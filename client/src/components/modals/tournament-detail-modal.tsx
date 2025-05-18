import { FC } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModals } from "@/hooks/use-modal";
import { useLanguage } from "@/hooks/use-language";
import { Tournament } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import CountdownTimer from "@/components/ui/countdown-timer";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TournamentDetailModalProps {
  open: boolean;
  tournament: Tournament | null;
}

const TournamentDetailModal: FC<TournamentDetailModalProps> = ({ 
  open, 
  tournament 
}) => {
  const { closeTournamentDetail, openLoginModal } = useModals();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      if (!user) throw new Error("User not logged in");
      
      // Create a team for this tournament
      const teamResponse = await apiRequest("POST", "/api/teams", {
        name: `${user.displayName}'s Team`,
        captainId: user.id,
        tournamentId
      });
      
      return teamResponse.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("registrationSuccess"),
        description: t("registrationSuccessMessage"),
      });
      
      closeTournamentDetail();
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast({
        title: t("registrationFailed"),
        description: t("registrationFailedMessage"),
        variant: "destructive",
      });
    }
  });

  const handleRegister = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    
    if (!tournament) return;
    
    if (user.walletBalance < tournament.entryFee) {
      toast({
        title: t("insufficientFunds"),
        description: t("insufficientFundsMessage"),
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate(tournament.id);
  };

  if (!tournament) return null;

  return (
    <Dialog open={open} onOpenChange={closeTournamentDetail}>
      <DialogContent className="sm:max-w-xl p-0 max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img 
            src={`https://source.unsplash.com/random/800x400/?esports,gaming&sig=${tournament.id}`} 
            alt="Tournament banner" 
            className="w-full h-52 object-cover" 
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
            onClick={closeTournamentDetail}
          >
            <i className="ri-close-line text-white text-xl"></i>
          </Button>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <span className="px-2 py-1 bg-primary text-white text-xs rounded font-medium">
              {tournament.type} • {tournament.gameMode}
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">{tournament.name}</h2>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <div className="text-sm text-muted-foreground">{t("entryFee")}</div>
              <div className="text-xl font-bold font-rajdhani">৳{tournament.entryFee}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("prizePool")}</div>
              <div className="text-xl font-bold font-rajdhani">
                ৳{tournament.prizePool.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("participants")}</div>
              <div className="text-xl font-bold font-rajdhani">
                {tournament.registeredTeams}/{tournament.maxTeams}
              </div>
            </div>
          </div>
          
          {tournament.status === "upcoming" && (
            <div className="p-4 rounded-lg mb-5 bg-muted">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{t("tournamentStartsIn")}</div>
                <div className="text-primary font-medium text-sm">
                  {new Date(tournament.startTime).toLocaleString()}
                </div>
              </div>
              <CountdownTimer targetDate={new Date(tournament.startTime)} />
            </div>
          )}
          
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-lg font-bold mb-2">{t("description")}</h3>
              <p className="text-sm text-muted-foreground">{tournament.description}</p>
            </div>
            
            {tournament.rules && (
              <div>
                <h3 className="text-lg font-bold mb-2">{t("rules")}</h3>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  {tournament.rules.split(". ").map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-bold mb-2">{t("prizeDistribution")}</h3>
              <div className="space-y-2">
                {tournament.prizes && Array.isArray(tournament.prizes) && tournament.prizes.map((prize, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded bg-muted">
                    <div className="flex items-center">
                      <span className={`w-8 h-8 flex items-center justify-center ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-700'} text-white rounded-full mr-2`}>
                        {prize.position}
                      </span>
                      <span>
                        {prize.position === 1
                          ? t("firstPlace")
                          : prize.position === 2
                          ? t("secondPlace")
                          : t("thirdPlace")}
                      </span>
                    </div>
                    <div className="font-bold">৳{prize.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full py-3" 
            onClick={handleRegister}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending 
              ? t("processing") 
              : tournament.status === "upcoming" 
              ? t("registerNow") 
              : t("joinNow")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentDetailModal;
