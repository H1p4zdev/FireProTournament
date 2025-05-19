import React, { useState, useContext } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Users, DollarSign, Award, Clock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '../App';

interface Tournament {
  id: string;
  title: string;
  description: string;
  entryFee: number;
  prizePool: number;
  startTime: Timestamp | Date;
  maxTeams: number;
  registeredTeams: number;
  tournamentType: 'solo' | 'duo' | 'squad';
  status: 'upcoming' | 'live' | 'completed';
  imageUrl?: string;
}

interface TournamentCardProps {
  tournament: Tournament;
  onRegister: (tournamentId: string) => void;
  onViewDetails: (tournamentId: string) => void;
}

export default function TournamentCard({ tournament, onRegister, onViewDetails }: TournamentCardProps) {
  const { toast } = useToast();
  const authContext = useContext(AuthContext);
  
  // Format date for display
  const formatDate = (date: Timestamp | Date): string => {
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    return jsDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (date: Timestamp | Date): string => {
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    return jsDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handleRegister = () => {
    if (!authContext?.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for tournaments",
        variant: "destructive"
      });
      return;
    }
    
    onRegister(tournament.id);
  };
  
  const handleViewDetails = () => {
    onViewDetails(tournament.id);
  };
  
  const getTournamentTypeText = (type: string): string => {
    switch (type) {
      case 'solo': return 'Solo';
      case 'duo': return 'Duo';
      case 'squad': return 'Squad';
      default: return type;
    }
  };
  
  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'upcoming':
        return (
          <div className="absolute top-3 right-3 bg-blue-500 rounded-md px-2 py-1 text-xs text-white font-medium">
            Upcoming
          </div>
        );
      case 'live':
        return (
          <div className="absolute top-3 right-3 bg-red-500 rounded-md px-2 py-1 text-xs text-white font-medium flex items-center">
            <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span> 
            Live
          </div>
        );
      case 'completed':
        return (
          <div className="absolute top-3 right-3 bg-gray-500 rounded-md px-2 py-1 text-xs text-white font-medium">
            Completed
          </div>
        );
    }
  };
  
  const isRegistrationOpen = tournament.status === 'upcoming' && tournament.registeredTeams < tournament.maxTeams;
  
  return (
    <div className="bg-dark-light rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl hover:translate-y-[-2px]">
      <div className="relative h-40">
        <img 
          src={tournament.imageUrl || "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=800&h=400"} 
          alt={tournament.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {getStatusBadge()}
        
        <div className="absolute bottom-3 left-3 bg-primary rounded-md px-2 py-1 text-xs text-white font-medium">
          {getTournamentTypeText(tournament.tournamentType)}
        </div>
        
        {tournament.entryFee > 0 ? (
          <div className="absolute bottom-3 right-3 bg-dark-light rounded-md px-2 py-1 text-xs text-accent font-medium flex items-center">
            <DollarSign className="w-3 h-3 mr-1" />
            {formatCurrency(tournament.entryFee)}
          </div>
        ) : (
          <div className="absolute bottom-3 right-3 bg-green-500/80 rounded-md px-2 py-1 text-xs text-white font-medium">
            Free Entry
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{tournament.title}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-400 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span>{formatDate(tournament.startTime)}</span>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            <span>{formatTime(tournament.startTime)}</span>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm">
            <Users className="w-4 h-4 mr-2 text-primary" />
            <span>{tournament.registeredTeams} / {tournament.maxTeams} Teams</span>
          </div>
          
          <div className="flex items-center text-accent text-sm font-medium">
            <Award className="w-4 h-4 mr-2 text-accent" />
            <span>Prize: {formatCurrency(tournament.prizePool)}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition"
          >
            View Details
          </button>
          
          {isRegistrationOpen ? (
            <button
              onClick={handleRegister}
              className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition"
            >
              Register Team
            </button>
          ) : (
            <button
              disabled
              className="flex-1 py-2 bg-gray-600 text-gray-300 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              {tournament.status === 'upcoming' ? 'Registration Full' : 'Closed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}