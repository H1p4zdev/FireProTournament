import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

export interface User {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  freeFireUid: string;
  mobileNumber: string;
  walletBalance: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  
  // Try to fetch current user on initial load
  const { data, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me"],
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  // Update user state when data changes
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  const login = (user: User) => {
    setUser(user);
    // In a real app, you would store the token in localStorage or a secure cookie
  };

  const logout = () => {
    setUser(null);
    // In a real app, you would clear the token
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
