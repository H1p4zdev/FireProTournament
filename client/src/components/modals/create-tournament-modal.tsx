import React from 'react';
import { X } from 'lucide-react';
import TournamentForm from '../forms/tournament-form';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTournamentModal({ isOpen, onClose }: CreateTournamentModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-dark-light rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Create Tournament</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <TournamentForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}