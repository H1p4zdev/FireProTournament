import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number): string => {
  return '৳' + amount.toLocaleString();
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (d.getTime() >= today.getTime() && d.getTime() < tomorrow.getTime()) {
    return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else if (d.getTime() >= tomorrow.getTime() && d.getTime() < tomorrow.getTime() + 86400000) {
    return `Tomorrow, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else {
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
};

export const getPaymentMethodIcon = (method: string): string => {
  switch (method?.toLowerCase()) {
    case 'bkash':
      return 'ri-wallet-3-line';
    case 'nagad':
      return 'ri-wallet-3-line';
    case 'rocket':
      return 'ri-rocket-line';
    case 'surecash':
      return 'ri-secure-payment-line';
    default:
      return 'ri-bank-card-line';
  }
};

export const getTransactionIcon = (type: string): string => {
  switch (type) {
    case 'deposit':
      return 'ri-add-line';
    case 'withdrawal':
      return 'ri-arrow-up-line';
    case 'tournament_entry':
      return 'ri-arrow-up-line';
    case 'tournament_winning':
      return 'ri-arrow-down-line';
    default:
      return 'ri-exchange-line';
  }
};

export const getTransactionColor = (type: string): string => {
  switch (type) {
    case 'deposit':
      return 'text-blue-400';
    case 'withdrawal':
      return 'text-error';
    case 'tournament_entry':
      return 'text-error';
    case 'tournament_winning':
      return 'text-success';
    default:
      return 'text-muted-foreground';
  }
};

export const getTransactionBgColor = (type: string): string => {
  switch (type) {
    case 'deposit':
      return 'bg-blue-900';
    case 'withdrawal':
      return 'bg-red-900';
    case 'tournament_entry':
      return 'bg-red-900';
    case 'tournament_winning':
      return 'bg-green-900';
    default:
      return 'bg-muted';
  }
};
