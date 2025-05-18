import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  phoneNumber: string;
  nickname: string;
  freeFireUID?: string;
  avatarUrl?: string;
  division?: string;
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phoneNumber: string, otp: string) => Promise<{ success: boolean, isNewUser?: boolean }>;
  createProfile: (profileData: {
    phoneNumber: string;
    nickname: string;
    freeFireUID: string;
    division?: string;
    avatarUrl?: string;
  }) => Promise<boolean>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Fetch fresh user data
        if (parsedUser.id) {
          refreshUserData();
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const refreshUserData = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const login = async (phoneNumber: string, otp: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/verify-otp', { phoneNumber, otp });
      const data = await response.json();
      
      if (data.isNewUser) {
        // New user needs to create profile
        return { success: true, isNewUser: true };
      } else {
        // Existing user, set user data
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return { success: true, isNewUser: false };
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login Failed",
        description: "Invalid phone number or OTP",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (profileData: {
    phoneNumber: string;
    nickname: string;
    freeFireUID: string;
    division?: string;
    avatarUrl?: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/users', profileData);
      const userData = await response.json();
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Failed to create profile:', error);
      toast({
        title: "Profile Creation Failed",
        description: "Please check your information and try again",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        createProfile,
        logout,
        refreshUserData
      }}
    >
      {children}
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
