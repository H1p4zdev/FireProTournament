import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from './lib/queryClient';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Pages
import SplashScreen from '@/pages/splash';
import AuthScreen from '@/pages/auth';
import CreateProfile from '@/pages/create-profile';
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';

// Firebase configuration - using environment variables
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

// Simple AuthContext
export const AuthContext = React.createContext<{
  user: any;
  loading: boolean;
}>({
  user: null,
  loading: true
});

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, loading }}>
        <Toaster />
        <Switch>
          <Route path="/" component={SplashScreen} />
          <Route path="/auth" component={AuthScreen} />
          <Route path="/create-profile" component={CreateProfile} />
          <Route path="/home" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}