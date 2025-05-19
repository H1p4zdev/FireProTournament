import React, { useState, useEffect, createContext } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SplashScreen from "@/pages/splash";
import AuthScreen from "@/pages/auth";
import CreateProfile from "@/pages/create-profile";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Tournaments from "@/pages/tournaments";
import TournamentFirebase from "@/pages/tournaments-firebase";
import TournamentDetails from "@/pages/tournament-details";
import Wallet from "@/pages/wallet";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Create an auth context
export const AuthContext = createContext<{
  user: User | null;
  userData: any | null;
  loading: boolean;
}>({
  user: null,
  userData: null,
  loading: true
});

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
          <TournamentFirebase />
        </Layout>
      </Route>
      
      <Route path="/tournament/:id">
        <Layout>
          <TournamentDetails />
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
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch additional user data from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <TooltipProvider>
      <AuthContext.Provider value={{ user, userData, loading }}>
        <Toaster />
        <Router />
      </AuthContext.Provider>
    </TooltipProvider>
  );
}

export default App;
