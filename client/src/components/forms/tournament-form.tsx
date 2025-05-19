import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth, AuthContext } from '../../App';
import { useContext } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  DollarSign, 
  FileText,
  Tag
} from 'lucide-react';

interface TournamentFormProps {
  onSuccess?: () => void;
}

export default function TournamentForm({ onSuccess }: TournamentFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entryFee, setEntryFee] = useState(0);
  const [prizePool, setPrizePool] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [maxTeams, setMaxTeams] = useState(20);
  const [tournamentType, setTournamentType] = useState('squad');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const authContext = useContext(AuthContext);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !startDate || !startTime || prizePool <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!authContext?.user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a tournament",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time into a timestamp
      const dateTime = new Date(startDate + 'T' + startTime);
      
      const tournament = {
        title,
        description,
        entryFee,
        prizePool,
        startTime: Timestamp.fromDate(dateTime),
        maxTeams,
        registeredTeams: 0,
        tournamentType,
        status: 'upcoming',
        createdBy: authContext.user.uid,
        imageUrl: imageUrl || null,
        createdAt: Timestamp.now()
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'tournaments'), tournament);
      
      toast({
        title: "Tournament Created",
        description: "Your tournament has been created successfully",
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setEntryFee(0);
      setPrizePool(0);
      setStartDate('');
      setStartTime('');
      setMaxTeams(20);
      setTournamentType('squad');
      setImageUrl('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create tournament",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-1">Tournament Title*</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Tag className="w-5 h-5 text-gray-400" />
          </span>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
            placeholder="Enter tournament title"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-gray-300 mb-1">Description*</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FileText className="w-5 h-5 text-gray-400" />
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
            placeholder="Enter tournament description, rules, etc."
            rows={4}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-1">Entry Fee</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="w-5 h-5 text-gray-400" />
            </span>
            <input 
              type="number"
              value={entryFee}
              onChange={(e) => setEntryFee(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-300 mb-1">Prize Pool*</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Award className="w-5 h-5 text-gray-400" />
            </span>
            <input 
              type="number"
              value={prizePool}
              onChange={(e) => setPrizePool(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Enter prize amount"
              min="1"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-1">Start Date*</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="w-5 h-5 text-gray-400" />
            </span>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-300 mb-1">Start Time*</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Clock className="w-5 h-5 text-gray-400" />
            </span>
            <input 
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-1">Max Teams</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Users className="w-5 h-5 text-gray-400" />
            </span>
            <select
              value={maxTeams}
              onChange={(e) => setMaxTeams(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value={10}>10 Teams</option>
              <option value={20}>20 Teams</option>
              <option value={30}>30 Teams</option>
              <option value={50}>50 Teams</option>
              <option value={100}>100 Teams</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-300 mb-1">Tournament Type</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Users className="w-5 h-5 text-gray-400" />
            </span>
            <select
              value={tournamentType}
              onChange={(e) => setTournamentType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-gray-300 mb-1">Tournament Image URL (optional)</label>
        <input 
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
          placeholder="Enter image URL"
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition ${isSubmitting ? 'bg-opacity-70 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? "Creating..." : "Create Tournament"}
      </button>
    </form>
  );
}