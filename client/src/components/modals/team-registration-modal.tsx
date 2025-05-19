import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '../../App';
import { useContext } from 'react';
import { addDoc, collection, updateDoc, doc, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../App';
import { X, Users, User, Trophy, DollarSign } from 'lucide-react';

interface TeamRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentName: string;
  tournamentType: 'solo' | 'duo' | 'squad';
  entryFee: number;
  maxTeams: number;
  registeredTeams: number;
}

interface TeamMember {
  name: string;
  freeFireId: string;
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
  const { toast } = useToast();
  const authContext = useContext(AuthContext);
  
  const [teamName, setTeamName] = useState(authContext?.userData?.nickname ? `${authContext.userData.nickname}'s Team` : '');
  const [members, setMembers] = useState<TeamMember[]>([
    { name: authContext?.userData?.nickname || '', freeFireId: authContext?.userData?.freeFireUID || '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine how many more members are needed based on tournament type
  const getRequiredMembersCount = () => {
    switch (tournamentType) {
      case 'solo': return 1;
      case 'duo': return 2;
      case 'squad': return 4;
      default: return 1;
    }
  };
  
  // Initialize members array based on tournament type
  React.useEffect(() => {
    if (tournamentType === 'solo') {
      setMembers([
        { name: authContext?.userData?.nickname || '', freeFireId: authContext?.userData?.freeFireUID || '' }
      ]);
    } else if (tournamentType === 'duo') {
      setMembers([
        { name: authContext?.userData?.nickname || '', freeFireId: authContext?.userData?.freeFireUID || '' },
        { name: '', freeFireId: '' }
      ]);
    } else if (tournamentType === 'squad') {
      setMembers([
        { name: authContext?.userData?.nickname || '', freeFireId: authContext?.userData?.freeFireUID || '' },
        { name: '', freeFireId: '' },
        { name: '', freeFireId: '' },
        { name: '', freeFireId: '' }
      ]);
    }
  }, [tournamentType, authContext?.userData]);
  
  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setMembers(updatedMembers);
  };
  
  const validateForm = () => {
    if (!teamName) {
      toast({
        title: "Team Name Required",
        description: "Please enter a team name",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if all required member fields are filled
    const requiredCount = getRequiredMembersCount();
    for (let i = 0; i < requiredCount; i++) {
      if (!members[i].name || !members[i].freeFireId) {
        toast({
          title: "Team Member Information Required",
          description: `Please fill in all fields for team member ${i + 1}`,
          variant: "destructive"
        });
        return false;
      }
    }
    
    // Check if the user has enough balance for entry fee
    if (entryFee > 0 && (authContext?.userData?.balance || 0) < entryFee) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to register for this tournament",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authContext?.user || !authContext?.userData) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for tournaments",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // 1. Create the team in Firestore
      const teamRef = await addDoc(collection(db, 'teams'), {
        name: teamName,
        captainId: authContext.userData.id,
        members: members.filter(m => m.name && m.freeFireId), // Only include filled members
        tournamentId,
        createdAt: serverTimestamp(),
        status: 'registered'
      });
      
      // 2. Increment the registered teams count for the tournament
      await updateDoc(doc(db, 'tournaments', tournamentId), {
        registeredTeams: increment(1)
      });
      
      // 3. If entry fee > 0, deduct from user's balance and create transaction
      if (entryFee > 0) {
        // Update user balance
        await updateDoc(doc(db, 'users', authContext.userData.id), {
          balance: increment(-entryFee)
        });
        
        // Create transaction record
        await addDoc(collection(db, 'transactions'), {
          userId: authContext.userData.id,
          amount: -entryFee,
          type: 'tournament_fee',
          description: `Entry fee for tournament: ${tournamentName}`,
          status: 'completed',
          createdAt: serverTimestamp()
        });
      }
      
      toast({
        title: "Registration Successful",
        description: `Your team has been registered for ${tournamentName}`
      });
      
      onClose();
      
      // Update user data in context to reflect new balance
      if (authContext.refreshUserData) {
        authContext.refreshUserData();
      }
      
    } catch (error) {
      console.error('Error registering team:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering your team. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-light rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="p-5 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Register Team</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          {/* Tournament Info */}
          <div className="mb-6 bg-dark rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">{tournamentName}</h4>
            
            <div className="flex items-center text-sm text-gray-300 mb-1">
              <Users className="w-4 h-4 mr-2 text-primary" />
              <span>{tournamentType.charAt(0).toUpperCase() + tournamentType.slice(1)} Tournament</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-300 mb-1">
              <Trophy className="w-4 h-4 mr-2 text-primary" />
              <span>{registeredTeams}/{maxTeams} Teams Registered</span>
            </div>
            
            {entryFee > 0 ? (
              <div className="flex items-center text-sm text-accent">
                <DollarSign className="w-4 h-4 mr-2 text-accent" />
                <span>Entry Fee: ৳{entryFee.toLocaleString()}</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-green-400">
                <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                <span>Free Entry</span>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Team Name */}
            <div className="mb-4">
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-1">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                placeholder="Enter team name"
                required
              />
            </div>
            
            {/* Team Members */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Team Members</h4>
              
              {members.map((member, index) => (
                <div key={index} className="bg-dark rounded-lg p-3 mb-2">
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 text-primary mr-2" />
                    <span className="text-white text-sm font-medium">
                      {index === 0 ? 'Captain' : `Member ${index}`}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Player Name
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        className="w-full bg-dark-light border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                        placeholder="Enter player name"
                        disabled={index === 0} // Captain info is fixed
                        required={index < getRequiredMembersCount()}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Free Fire ID
                      </label>
                      <input
                        type="text"
                        value={member.freeFireId}
                        onChange={(e) => handleMemberChange(index, 'freeFireId', e.target.value)}
                        className="w-full bg-dark-light border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                        placeholder="Enter Free Fire ID"
                        disabled={index === 0} // Captain info is fixed
                        required={index < getRequiredMembersCount()}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <p className="text-xs text-gray-400 mt-2">
                {tournamentType === 'solo' ? 'Solo tournament requires 1 player' : 
                 tournamentType === 'duo' ? 'Duo tournament requires 2 players' : 
                 'Squad tournament requires 4 players'}
              </p>
            </div>
            
            {/* Registration Fee */}
            {entryFee > 0 && (
              <div className="mb-6 p-3 bg-dark rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Entry Fee:</span>
                  <span className="text-accent font-medium">৳{entryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-300">Your Balance:</span>
                  <span className={`font-medium ${(authContext?.userData?.balance || 0) < entryFee ? 'text-red-400' : 'text-green-400'}`}>
                    ৳{(authContext?.userData?.balance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || registeredTeams >= maxTeams}
              className={`w-full py-3 rounded-lg font-medium 
                ${isLoading ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 
                 registeredTeams >= maxTeams ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 
                 'bg-primary text-white hover:bg-opacity-90 transition'}`}
            >
              {isLoading ? 'Registering...' : 
               registeredTeams >= maxTeams ? 'Tournament Full' : 
               'Confirm Registration'}
            </button>
            
            {entryFee > 0 && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                The entry fee will be deducted from your wallet balance
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}