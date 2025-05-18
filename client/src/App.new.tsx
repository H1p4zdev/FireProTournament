import { Switch, Route } from "wouter";
import HomePage from "./pages/home";
import TournamentsPage from "./pages/tournaments";
import LeaderboardPage from "./pages/leaderboard";
import ProfilePage from "./pages/profile";
import NotFound from "./pages/not-found";
import { LoginModal } from "@/components/modals/login-modal";
import { WalletModal } from "@/components/modals/wallet-modal";
import { TournamentDetailModal } from "@/components/modals/tournament-detail-modal";
import { CreateTournamentModal } from "@/components/modals/create-tournament-modal";
import { useModals } from "@/hooks/use-modal";

export default function App() {
  const { 
    loginModalOpen, 
    closeLoginModal,
    walletModalOpen, 
    closeWalletModal,
    selectedTournament,
    closeTournamentDetail,
    createTournamentModalOpen,
    closeCreateTournamentModal
  } = useModals();

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/tournaments" component={TournamentsPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
      
      <LoginModal open={loginModalOpen} onClose={closeLoginModal} />
      <WalletModal open={walletModalOpen} onClose={closeWalletModal} />
      <TournamentDetailModal 
        open={selectedTournament !== null} 
        tournament={selectedTournament} 
        onClose={closeTournamentDetail} 
      />
      <CreateTournamentModal 
        open={createTournamentModalOpen} 
        onClose={closeCreateTournamentModal} 
      />
    </div>
  );
}