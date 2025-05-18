import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import TournamentsPage from "@/pages/tournaments";
import LeaderboardPage from "@/pages/leaderboard";
import ProfilePage from "@/pages/profile";
import MobileNav from "@/components/ui/mobile-nav";
import { useModals } from "@/hooks/use-modal";
import LoginModal from "@/components/modals/login-modal";
import WalletModal from "@/components/modals/wallet-modal";
import TournamentDetailModal from "@/components/modals/tournament-detail-modal";
import CreateTournamentModal from "@/components/modals/create-tournament-modal";
import { useEffect } from "react";
import { useLocation } from "wouter";

function App() {
  const { 
    loginModalOpen, 
    walletModalOpen, 
    selectedTournament, 
    createTournamentModalOpen
  } = useModals();
  
  const [location, setLocation] = useLocation();
  
  // Set document title based on route
  useEffect(() => {
    let title = "FireTourney - Mobile Game Tournaments";
    
    switch (location) {
      case "/tournaments":
        title = "Tournaments - FireTourney";
        break;
      case "/leaderboard":
        title = "Leaderboard - FireTourney";
        break;
      case "/profile":
        title = "My Profile - FireTourney";
        break;
    }
    
    document.title = title;
  }, [location]);

  return (
    <TooltipProvider>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/tournaments" component={TournamentsPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
      
      <MobileNav />
      
      {/* Modals */}
      <LoginModal open={loginModalOpen} />
      <WalletModal open={walletModalOpen} />
      <TournamentDetailModal 
        open={!!selectedTournament} 
        tournament={selectedTournament} 
      />
      <CreateTournamentModal open={createTournamentModalOpen} />
    </TooltipProvider>
  );
}

export default App;
