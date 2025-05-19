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
  onSuccess?: () => void;
}

export default function TeamRegistrationForm({ 
  tournamentId, 
  tournamentType, 
  entryFee,
  maxTeams,
  registeredTeams,
  onSuccess 
}: TeamRegistrationFormProps) {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<{name: string, freeFireId: string}[]>([
    { name: '', freeFireId: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const authContext = useContext(AuthContext);
  const { toast } = useToast();
  
  // Calculate how many members are needed based on tournament type
  const getRequiredMembers = () => {
    switch (tournamentType) {
      case 'solo': return 1;
      case 'duo': return 2;
      case 'squad': return 4;
      default: return 4;
    }
  };
  
  // Initialize members array based on tournament type
  React.useEffect(() => {
    const requiredMembers = getRequiredMembers();
    if (members.length !== requiredMembers) {
      setMembers(Array(requiredMembers).fill(0).map(() => ({ name: '', freeFireId: '' })));
    }
  }, [tournamentType]);
  
  const handleMemberChange = (index: number, field: 'name' | 'freeFireId', value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    setMembers(updatedMembers);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName) {
      toast({
        title: "Missing Information",
        description: "Please enter a team name",
        variant: "destructive"
      });
      return;
    }
    
    // Check if all required member info is filled
    const hasEmptyFields = members.some(member => !member.name || !member.freeFireId);
    if (hasEmptyFields) {
      toast({
        title: "Missing Information",
        description: "Please fill in all member information",
        variant: "destructive"
      });
      return;
    }
    
    if (!authContext?.user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to register a team",
        variant: "destructive"
      });
      return;
    }
    
    // Check if tournament is full
    if (registeredTeams >= maxTeams) {
      toast({
        title: "Tournament Full",
        description: "This tournament has reached its maximum number of teams",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if user has enough balance for entry fee
      if (entryFee > 0) {
        const userDocRef = doc(db, 'users', authContext.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          throw new Error("User profile not found");
        }
        
        const userData = userDoc.data();
        if (userData.balance < entryFee) {
          toast({
            title: "Insufficient Balance",
            description: `You need ${entryFee} coins to register for this tournament. Please add funds to your wallet.`,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        // Deduct entry fee from user's balance
        await updateDoc(userDocRef, {
          balance: increment(-entryFee)
        });
        
        // Add transaction record
        await addDoc(collection(db, 'transactions'), {
          userId: authContext.user.uid,
          amount: -entryFee,
          type: 'tournament_fee',
          status: 'completed',
          description: `Tournament entry fee for ${teamName}`,
          createdAt: Timestamp.now()
        });
      }
      
      // Create the team
      const team = {
        name: teamName,
        tournamentId,
        captainId: authContext.user.uid,
        members: members.map(member => ({
          name: member.name,
          freeFireId: member.freeFireId
        })),
        createdAt: Timestamp.now(),
        status: 'registered'
      };
      
      await addDoc(collection(db, 'teams'), team);
      
      // Update tournament registered teams count
      const tournamentRef = doc(db, 'tournaments', tournamentId);
      await updateDoc(tournamentRef, {
        registeredTeams: increment(1)
      });
      
      toast({
        title: "Team Registered",
        description: "Your team has been successfully registered for the tournament",
      });
      
      // Reset form
      setTeamName('');
      setMembers(Array(getRequiredMembers()).fill(0).map(() => ({ name: '', freeFireId: '' })));
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error registering team:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register team",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-1">Team Name*</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Tag className="w-5 h-5 text-gray-400" />
          </span>
          <input 
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
            placeholder="Enter your team name"
            required
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <Trophy className="w-5 h-5 text-primary mr-2" />
          <h3 className="text-lg font-medium">Team Members</h3>
        </div>
        
        {members.map((member, index) => (
          <div key={index} className="p-4 bg-dark rounded-lg border border-gray-700">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-gray-400 mr-2" />
              <p className="text-sm text-gray-300">
                {index === 0 ? "Captain (You)" : `Member ${index}`}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Player Name*</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </span>
                  <input 
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary text-sm"
                    placeholder="In-game name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-1">Free Fire ID*</label>
                <input 
                  type="text"
                  value={member.freeFireId}
                  onChange={(e) => handleMemberChange(index, 'freeFireId', e.target.value)}
                  className="w-full px-4 py-2 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary text-sm"
                  placeholder="9-12 digit ID"
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {entryFee > 0 && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-primary" />
            <span>
              Entry fee: <span className="font-bold text-primary">{entryFee} coins</span> will be deducted from your wallet
            </span>
          </p>
        </div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition ${isSubmitting ? 'bg-opacity-70 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? "Registering..." : "Register Team"}
      </button>
    </form>
  );
}