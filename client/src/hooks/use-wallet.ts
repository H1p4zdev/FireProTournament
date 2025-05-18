import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction, InsertTransaction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

export function useWallet() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch transactions for the current user
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: [`/api/users/${user?.id}/transactions`],
    enabled: !!user, // Only run if user is logged in
  });
  
  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async (transaction: InsertTransaction) => {
      const response = await apiRequest("POST", "/api/transactions", transaction);
      return response.json();
    },
    onSuccess: (data) => {
      // Update user wallet balance
      if (user && data.user) {
        updateUser(data.user);
      }
      
      // Invalidate transactions query
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/transactions`] });
    }
  });
  
  // Withdraw funds mutation
  const withdrawFundsMutation = useMutation({
    mutationFn: async (transaction: InsertTransaction) => {
      const response = await apiRequest("POST", "/api/transactions", transaction);
      return response.json();
    },
    onSuccess: (data) => {
      // Update user wallet balance
      if (user && data.user) {
        updateUser(data.user);
      }
      
      // Invalidate transactions query
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/transactions`] });
    }
  });
  
  return {
    transactions,
    addFunds: addFundsMutation.mutate,
    withdrawFunds: withdrawFundsMutation.mutate,
    isLoading: addFundsMutation.isPending || withdrawFundsMutation.isPending,
  };
}
