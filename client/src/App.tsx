import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/providers/language-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import SplashScreen from "@/pages/splash";
import AuthScreen from "@/pages/auth";
import CreateProfile from "@/pages/create-profile";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Tournaments from "@/pages/tournaments";
import Wallet from "@/pages/wallet";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashScreen} />
      <Route path="/auth" component={AuthScreen} />
      <Route path="/create-profile" component={CreateProfile} />
      
      <Route path="/home">
        <Layout>
          <Home />
        </Layout>
      </Route>
      
      <Route path="/tournaments">
        <Layout>
          <Tournaments />
        </Layout>
      </Route>
      
      <Route path="/wallet">
        <Layout>
          <Wallet />
        </Layout>
      </Route>
      
      <Route path="/leaderboard">
        <Layout>
          <Leaderboard />
        </Layout>
      </Route>
      
      <Route path="/profile">
        <Layout>
          <Profile />
        </Layout>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
