import { useState } from 'react';

// Create a mock auth hook to use until the real authentication is fixed
export function useAuth() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  return {
    user: {
      uid: 'mock-user-id',
      phoneNumber: '+8801712345678',
      nickname: 'Demo User',
      freeFireUID: '123456789',
      balance: 5000
    },
    userData: {
      id: 'mock-user-id',
      phoneNumber: '+8801712345678',
      nickname: 'Demo User',
      freeFireUID: '123456789',
      avatarUrl: null,
      division: 'Dhaka',
      balance: 5000,
      createdAt: new Date()
    },
    isLoading: false,
    isAuthenticated: true,
    loginWithPhone: async () => ({ success: true }),
    verifyOtp: async () => ({ success: true, isNewUser: false }),
    createProfile: async () => true,
    logout: async () => {},
    refreshUserData: async () => {},
    isAuthModalOpen,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => setIsAuthModalOpen(false)
  };
}