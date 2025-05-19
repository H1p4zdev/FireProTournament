import React, { useState, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db, AuthContext } from '../../App';
import { 
  Users, 
  User, 
  Trophy,
  Tag,
  DollarSign
} from 'lucide-react';

interface TeamRegistrationFormProps {
  tournamentId: string;
  tournamentType: string;
  entryFee: number;
  maxTeams: number;
  registeredTeams: number;
  onSuccess: () => void;
}

interface TeamMember {
  name: string;
  freeFireId: string;
}

export default function TeamRegistrationForm({
  tournamentId,
  tournamentType,
  entryFee,
  maxTeams,
  registeredTeams,
  onSuccess
}: TeamRegistrationFormProps) {
  const { toast } = useToast();
  const authContext = useContext(AuthContext);
  
  const [teamName, setTeamName] = useState(authContext?.userData?.nickname ? `${authContext.userData.nickname}'s Team` : '');
  const [isLoading, setIsLoading] = useState(false);
  
  // Set up team members based on tournament type
  const getInitialMembers = () => {
    const captainMember = { 
      name: authContext?.userData?.nickname || '', 
      freeFireId: authContext?.userData?.freeFireUID || '' 
    };
    
    switch(tournamentType) {
      case 'solo':
        return [captainMember];
      case 'duo':
        return [captainMember, { name: '', freeFireId: '' }];
      case 'squad':
        return [
          captainMember,
          { name: '', freeFireId: '' },
          { name: '', freeFireId: '' },
          { name: '', freeFireId: '' }
        ];
      default:
        return [captainMember];
    }
  };
  
  const [members, setMembers] = useState<TeamMember[]>(getInitialMembers());
  
  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setMembers(updatedMembers);
  };
  
  const validateForm = () => {
    if (!teamName.trim()) {
      toast({
        title: "Team Name Required",
        description: "Please enter a team name",
        variant: "destructive"
      });
      return false;
    }
    
    // Calculate required members based on tournament type
    const requiredMembersCount = tournamentType === 'solo' ? 1 : 
                               tournamentType === 'duo' ? 2 : 4;
    
    // Check if all required members have both name and Free Fire ID
    for (let i = 0; i < requiredMembersCount; i++) {
      if (!members[i] || !members[i].name.trim() || !members[i].freeFireId.trim()) {
        toast({
          title: "Member Information Required",
          description: `Please fill in all details for member ${i + 1}`,
          variant: "destructive"
        });
        return false;
      }
    }
    
    // Check if user has enough balance for entry fee
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
        description: "Please log in to register for this tournament",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateForm()) return;
    
    // Check if tournament is already full
    if (registeredTeams >= maxTeams) {
      toast({
        title: "Tournament Full",
        description: "This tournament has reached its maximum number of teams",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Get tournament details to double-check
      const tournamentRef = doc(db, 'tournaments', tournamentId);
      const tournamentDoc = await getDoc(tournamentRef);
      
      if (!tournamentDoc.exists()) {
        toast({
          title: "Tournament Not Found",
          description: "The tournament you're trying to register for doesn't exist",
          variant: "destructive"
        });
        return;
      }
      
      const tournamentData = tournamentDoc.data();
      
      // Make sure tournament isn't full and registration is still open
      if (tournamentData.registeredTeams >= tournamentData.maxTeams) {
        toast({
          title: "Tournament Full",
          description: "This tournament has reached its maximum number of teams",
          variant: "destructive"
        });
        return;
      }
      
      if (tournamentData.status !== 'upcoming') {
        toast({
          title: "Registration Closed",
          description: "Registration for this tournament is no longer open",
          variant: "destructive"
        });
        return;
      }
      
      // 2. Create team document
      const validMembers = members.filter(member => member.name.trim() && member.freeFireId.trim());
      await addDoc(collection(db, 'teams'), {
        name: teamName,
        captainId: authContext.userData.id,
        members: validMembers,
        tournamentId,
        createdAt: Timestamp.now(),
        status: 'registered'
      });
      
      // 3. Update tournament registeredTeams count
      await updateDoc(tournamentRef, {
        registeredTeams: increment(1)
      });
      
      // 4. If there's an entry fee, deduct from user balance and create transaction
      if (entryFee > 0) {
        // Update user balance
        const userRef = doc(db, 'users', authContext.userData.id);
        await updateDoc(userRef, {
          balance: increment(-entryFee)
        });
        
        // Create transaction record
        await addDoc(collection(db, 'transactions'), {
          userId: authContext.userData.id,
          amount: -entryFee,
          type: 'tournament_fee',
          description: `Entry fee for tournament: ${tournamentData.title}`,
          status: 'completed',
          createdAt: Timestamp.now()
        });
      }
      
      toast({
        title: "Registration Successful",
        description: "Your team has been registered for the tournament"
      });
      
      // Update user data in auth context
      if (authContext.refreshUserData) {
        authContext.refreshUserData();
      }
      
      // Call success callback
      onSuccess();
      
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Team Name */}
      <div>
        <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-1">
          Team Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="bg-dark-light border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-full text-white focus:ring-primary focus:border-primary"
            placeholder="Enter team name"
            required
          />
        </div>
      </div>
      
      {/* Tournament Type Information */}
      <div className="bg-dark-light p-3 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-white">
            {tournamentType === 'solo' ? 'Solo Tournament' : 
             tournamentType === 'duo' ? 'Duo Tournament' : 'Squad Tournament'}
          </span>
        </div>
        <p className="text-sm text-gray-400">
          {tournamentType === 'solo' ? 'You are entering as a solo player.' : 
           tournamentType === 'duo' ? 'You need to register with 1 teammate.' : 
           'You need to register with 3 teammates.'}
        </p>
      </div>
      
      {/* Team Members */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          Team Members
        </label>
        
        {members.map((member, index) => (
          <div key={index} className="bg-dark-light p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <User className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-white">
                {index === 0 ? 'Captain (You)' : `Player ${index + 1}`}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                  className="bg-dark border border-gray-700 rounded-lg px-3 py-2 w-full text-white text-sm"
                  placeholder="Player name"
                  disabled={index === 0} // Captain info should be fixed
                  required={tournamentType === 'solo' ? index === 0 : 
                           tournamentType === 'duo' ? index < 2 : index < 4}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Free Fire ID</label>
                <input
                  type="text"
                  value={member.freeFireId}
                  onChange={(e) => handleMemberChange(index, 'freeFireId', e.target.value)}
                  className="bg-dark border border-gray-700 rounded-lg px-3 py-2 w-full text-white text-sm"
                  placeholder="Enter Free Fire ID"
                  disabled={index === 0} // Captain info should be fixed
                  required={tournamentType === 'solo' ? index === 0 : 
                           tournamentType === 'duo' ? index < 2 : index < 4}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Entry Fee Information */}
      {entryFee > 0 && (
        <div className="bg-dark-light p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-white">Entry Fee</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Fee:</span>
            <span className="text-sm font-medium text-accent">৳{entryFee.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between mt-1">
            <span className="text-sm text-gray-400">Your Balance:</span>
            <span className={`text-sm font-medium ${
              (authContext?.userData?.balance || 0) < entryFee ? 'text-red-500' : 'text-green-500'
            }`}>
              ৳{(authContext?.userData?.balance || 0).toLocaleString()}
            </span>
          </div>
          
          {(authContext?.userData?.balance || 0) < entryFee && (
            <p className="text-xs text-red-500 mt-2">
              Insufficient balance. Please add funds to your wallet.
            </p>
          )}
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || registeredTeams >= maxTeams}
        className={`w-full py-3 rounded-lg font-medium text-white ${
          isLoading ? 'bg-gray-600 cursor-not-allowed' : 
          registeredTeams >= maxTeams ? 'bg-gray-600 cursor-not-allowed' : 
          'bg-primary hover:bg-primary/90 transition'
        }`}
      >
        {isLoading ? 'Registering...' : 
         registeredTeams >= maxTeams ? 'Tournament Full' : 
         'Register Team'}
      </button>
      
      {registeredTeams >= maxTeams && (
        <p className="text-xs text-red-500 text-center">
          This tournament has reached its maximum number of teams.
        </p>
      )}
      
      <p className="text-xs text-gray-400 text-center">
        By registering, you agree to the tournament rules and regulations.
      </p>
    </form>
  );
}