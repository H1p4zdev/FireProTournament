import { useQuery } from "@tanstack/react-query";
import { Tournament } from "@shared/schema";

export function useTournaments(filter?: { status?: string, type?: string }) {
  const queryKey = ["/api/tournaments"];
  
  if (filter) {
    const searchParams = new URLSearchParams();
    if (filter.status) searchParams.append("status", filter.status);
    if (filter.type) searchParams.append("type", filter.type);
    
    if (searchParams.toString()) {
      queryKey[0] = `/api/tournaments?${searchParams.toString()}`;
    }
  }
  
  return useQuery<Tournament[]>({
    queryKey,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useTournament(id: number | undefined) {
  return useQuery<Tournament>({
    queryKey: [`/api/tournaments/${id}`],
    enabled: !!id, // Only run the query if an ID is provided
  });
}
