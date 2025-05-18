import { createContext, useContext, useState, ReactNode } from "react";
import { Tournament } from "@shared/schema";

interface ModalContextType {
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  
  walletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  
  selectedTournament: Tournament | null;
  openTournamentDetail: (tournament: Tournament) => void;
  closeTournamentDetail: () => void;
  
  createTournamentModalOpen: boolean;
  openCreateTournamentModal: () => void;
  closeCreateTournamentModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }): JSX.Element {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [createTournamentModalOpen, setCreateTournamentModalOpen] = useState(false);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);
  
  const openWalletModal = () => setWalletModalOpen(true);
  const closeWalletModal = () => setWalletModalOpen(false);
  
  const openTournamentDetail = (tournament: Tournament) => setSelectedTournament(tournament);
  const closeTournamentDetail = () => setSelectedTournament(null);
  
  const openCreateTournamentModal = () => setCreateTournamentModalOpen(true);
  const closeCreateTournamentModal = () => setCreateTournamentModalOpen(false);

  return (
    <ModalContext.Provider
      value={{
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
        
        walletModalOpen,
        openWalletModal,
        closeWalletModal,
        
        selectedTournament,
        openTournamentDetail,
        closeTournamentDetail,
        
        createTournamentModalOpen,
        openCreateTournamentModal,
        closeCreateTournamentModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
