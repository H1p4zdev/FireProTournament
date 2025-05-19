import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Add global type definition for recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

interface User {
  uid: string;
  phoneNumber: string;
  nickname: string;
  freeFireUID: string;
  avatarUrl?: string | null;
  division?: string | null;
  balance: number;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithPhone: (phoneNumber: string) => Promise<{ success: boolean }>;
  verifyOtp: (otp: string) => Promise<{ success: boolean, isNewUser?: boolean }>;
  createProfile: (profileData: {
    nickname: string;
    freeFireUID: string;
    division?: string;
    avatarUrl?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({
            ...userData,
            uid: currentUser.uid,
            // Convert Firestore timestamp to Date if needed
            createdAt: userData.createdAt instanceof Date ? 
              userData.createdAt : 
              new Date(userData.createdAt as any)
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (!firebaseUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser({
          ...userData,
          uid: firebaseUser.uid,
          createdAt: userData.createdAt instanceof Date ? 
            userData.createdAt : 
            new Date(userData.createdAt as any)
        });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh user data",
        variant: "destructive"
      });
    }
  };

  // Initialize recaptcha verifier
  const setupRecaptcha = () => {
    // For development we'll use invisible recaptcha
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('Recaptcha verified');
        },
        'expired-callback': () => {
          console.log('Recaptcha expired');
        }
      });
    }
    return window.recaptchaVerifier;
  };

  const loginWithPhone = async (phone: string) => {
    setIsLoading(true);
    setPhoneNumber(phone);
    
    try {
      const appVerifier = setupRecaptcha();
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(phone, appVerifier);
      setVerificationId(verificationId);
      
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your phone",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    if (!verificationId || !phoneNumber) {
      toast({
        title: "Error",
        description: "Phone verification not initiated",
        variant: "destructive"
      });
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      
      // Check if this is a new user by looking for their profile
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // This is a new user
        return { success: true, isNewUser: true };
      } else {
        // Existing user
        const userData = userDoc.data() as User;
        setUser({
          ...userData,
          uid: result.user.uid,
          createdAt: userData.createdAt instanceof Date ? 
            userData.createdAt : 
            new Date(userData.createdAt as any)
        });
        
        return { success: true, isNewUser: false };
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (profileData: {
    nickname: string;
    freeFireUID: string;
    division?: string;
    avatarUrl?: string;
  }) => {
    if (!firebaseUser || !phoneNumber) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    try {
      const newUser: User = {
        uid: firebaseUser.uid,
        phoneNumber: phoneNumber,
        nickname: profileData.nickname,
        freeFireUID: profileData.freeFireUID,
        division: profileData.division,
        avatarUrl: profileData.avatarUrl,
        balance: 0, // Starting balance
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser(newUser);
      
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      navigate('/auth');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticated: !!user,
        loginWithPhone,
        verifyOtp,
        createProfile,
        logout,
        refreshUserData
      }}
    >
      {children}
      <div id="recaptcha-container"></div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
