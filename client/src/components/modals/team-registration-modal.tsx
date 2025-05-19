import React from 'react';
import { X } from 'lucide-react';
import TeamRegistrationForm from '../forms/team-registration-form';

interface TeamRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentName: string;
  tournamentType: string;
  entryFee: number;
  maxTeams: number;
  registeredTeams: number;
}

export default function TeamRegistrationModal({ 
  isOpen, 
  onClose,
  tournamentId,
  tournamentName,
  tournamentType,
  entryFee,
  maxTeams,
  registeredTeams
}: TeamRegistrationModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-dark-light rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold">Register Team</h2>
            <p className="text-sm text-gray-400">{tournamentName}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <TeamRegistrationForm 
            tournamentId={tournamentId}
            tournamentType={tournamentType}
            entryFee={entryFee}
            maxTeams={maxTeams}
            registeredTeams={registeredTeams}
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
}