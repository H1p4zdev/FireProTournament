// Common types used throughout the application

export interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  active?: boolean;
}

export interface Prize {
  position: number;
  amount: number;
}

export interface TopPlayer {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  freeFireUid: string;
  tournamentWins: number;
  points?: number;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  color: string;
}
