import { FC } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useModals } from "@/hooks/use-modal";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import Logo from "./logo";
import LanguageToggle from "./language-toggle";
import ThemeToggle from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MobileNav: FC = () => {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { 
    openLoginModal, 
    openWalletModal,
    openCreateTournamentModal
  } = useModals();

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 py-3 px-4 shadow-md bg-card">
        <div className="flex justify-between items-center">
          <Logo />
          
          <div className="flex items-center space-x-3">
            <LanguageToggle />
            <ThemeToggle />
            
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openWalletModal}
                  aria-label="Open wallet"
                >
                  <i className="ri-wallet-3-line text-xl"></i>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative p-0 h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.displayName} />
                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">{t("profile")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tournaments">{t("myTournaments")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <span className="text-destructive">{t("logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={openLoginModal} size="sm" className="px-3 py-2 rounded-lg">
                <i className="ri-login-box-line mr-1"></i>
                {t("login")}
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] bg-card">
        <div className="flex justify-around py-2">
          <Link href="/">
            <Button
              variant="ghost"
              className={`flex flex-col items-center py-1 px-3 h-auto ${
                location === "/" ? "text-primary" : ""
              }`}
            >
              <i className="ri-home-5-line text-xl"></i>
              <span className="text-xs mt-1">{t("home")}</span>
            </Button>
          </Link>
          
          <Link href="/tournaments">
            <Button
              variant="ghost"
              className={`flex flex-col items-center py-1 px-3 h-auto ${
                location === "/tournaments" ? "text-primary" : ""
              }`}
            >
              <i className="ri-trophy-line text-xl"></i>
              <span className="text-xs mt-1">{t("tournaments")}</span>
            </Button>
          </Link>
          
          <Button
            onClick={user ? openCreateTournamentModal : openLoginModal}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-primary text-white -mt-4"
          >
            <i className="ri-add-line text-xl"></i>
          </Button>
          
          <Link href="/leaderboard">
            <Button
              variant="ghost"
              className={`flex flex-col items-center py-1 px-3 h-auto ${
                location === "/leaderboard" ? "text-primary" : ""
              }`}
            >
              <i className="ri-bar-chart-line text-xl"></i>
              <span className="text-xs mt-1">{t("leaderboard")}</span>
            </Button>
          </Link>
          
          <Link href="/profile">
            <Button
              variant="ghost"
              className={`flex flex-col items-center py-1 px-3 h-auto ${
                location === "/profile" ? "text-primary" : ""
              }`}
            >
              <i className="ri-user-3-line text-xl"></i>
              <span className="text-xs mt-1">{t("profile")}</span>
            </Button>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
