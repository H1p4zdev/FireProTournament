import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'wouter';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, AuthContext } from '../App';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Users, Award, DollarSign, Info, ChevronLeft, Trophy } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import TeamRegistrationModal from '@/components/modals/team-registration-modal';

interface Tournament {
  id: string;
  title: string;
  description: string;
  entryFee: number;
  prizePool: number;
  startTime: Timestamp;
  maxTeams: number;
  registeredTeams: number;
  tournamentType: 'solo' | 'duo' | 'squad';
  status: 'upcoming' | 'live' | 'completed';
  imageUrl?: string;
  createdAt: Timestamp;
}

interface Team {
  id: string;
  name: string;
  captainId: string;
  members: Array<{
    name: string;
    freeFireId: string;
  }>;
  tournamentId: string;
  createdAt: Timestamp;
  status: string;
}

export default function TournamentDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const authContext = useContext(AuthContext);
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchTournamentAndTeams = async () => {
      if (!id) return;
      
      try {
        // Fetch tournament details
        const tournamentDoc = await getDoc(doc(db, 'tournaments', id));
        
        if (!tournamentDoc.exists()) {
          toast({
            title: "Tournament Not Found",
            description: "The tournament you're looking for doesn't exist",
            variant: "destructive"
          });
          navigate('/tournaments');
          return;
        }
        
        const tournamentData = {
          id: tournamentDoc.id,
          ...tournamentDoc.data()
        } as Tournament;
        
        setTournament(tournamentData);
        
        // Fetch teams for this tournament
        const teamsQuery = query(
          collection(db, 'teams'),
          where('tournamentId', '==', id)
        );
        
        const teamsSnapshot = await getDocs(teamsQuery);
        const teamsData = teamsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Team[];
        
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching tournament details:', error);
        toast({
          title: "Error",
          description: "Failed to load tournament details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTournamentAndTeams();
  }, [id, navigate, toast]);
  
  const formatDate = (date: Timestamp | Date): string => {
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    return jsDate.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  };
  
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
    
    setRegistrationModalOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!tournament) {
    return (
      <div className="min-h-screen bg-dark p-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-4">Tournament Not Found</h2>
        <button
          onClick={() => navigate('/tournaments')}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Back to Tournaments
        </button>
      </div>
    );
  }
  
  const isRegistrationOpen = tournament.status === 'upcoming' && tournament.registeredTeams < tournament.maxTeams;
  
  return (
    <div className="min-h-screen bg-dark">
      {/* Banner */}
      <div className="relative h-64 md:h-80">
        <img 
          src={tournament.imageUrl || "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1600&h=400"} 
          alt={tournament.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
        
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate('/tournaments')}
            className="flex items-center bg-dark/70 backdrop-blur-sm hover:bg-dark text-white rounded-lg px-4 py-2 transition"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
        </div>
      </div>
      
      {/* Tournament Info */}
      <div className="container mx-auto px-4 py-6 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end">
          <div className="flex-grow">
            <div className="inline-block bg-primary text-white text-sm font-medium px-3 py-1 rounded-full mb-2">
              {tournament.tournamentType.charAt(0).toUpperCase() + tournament.tournamentType.slice(1)}
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">{tournament.title}</h1>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
              <div className="flex items-center text-gray-300">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                <span>{formatDate(tournament.startTime)}</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                <span>{formatTime(tournament.startTime)}</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <Users className="w-4 h-4 mr-2 text-primary" />
                <span>{tournament.registeredTeams} / {tournament.maxTeams} Teams</span>
              </div>
              
              <div className="flex items-center text-accent font-medium">
                <Award className="w-4 h-4 mr-2 text-accent" />
                <span>Prize: {formatCurrency(tournament.prizePool)}</span>
              </div>
              
              {tournament.entryFee > 0 ? (
                <div className="flex items-center text-gray-300">
                  <DollarSign className="w-4 h-4 mr-2 text-primary" />
                  <span>Entry Fee: {formatCurrency(tournament.entryFee)}</span>
                </div>
              ) : (
                <div className="flex items-center text-green-400">
                  <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                  <span>Free Entry</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            {isRegistrationOpen ? (
              <button
                onClick={handleRegister}
                className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition"
              >
                Register Team
              </button>
            ) : (
              <button
                disabled
                className="w-full md:w-auto px-6 py-3 bg-gray-600 text-gray-300 rounded-lg font-medium cursor-not-allowed"
              >
                {tournament.status === 'upcoming' ? 'Registration Full' : 'Registration Closed'}
              </button>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-700 mt-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'overview' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'teams' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Teams ({teams.length})
            </button>
            {tournament.status === 'completed' && (
              <button
                onClick={() => setActiveTab('results')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'results' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Results
              </button>
            )}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'overview' && (
            <div className="prose prose-invert max-w-none">
              <div className="flex items-start mb-4">
                <Info className="w-5 h-5 text-primary mt-1 mr-2 flex-shrink-0" />
                <div className="p-4 bg-dark-light rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Tournament Description</h3>
                  <p className="text-gray-300 whitespace-pre-line">{tournament.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 bg-dark-light rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4">Tournament Rules</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li>All players must be registered before the tournament starts</li>
                    <li>Teams must check in 30 minutes before the tournament</li>
                    <li>No player substitutions allowed after registration</li>
                    <li>Tournament format will be battle royale</li>
                    <li>Points are awarded for placement and eliminations</li>
                    <li>Cheating will result in immediate disqualification</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-dark-light rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4">Prize Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center font-bold text-dark mr-3">1</div>
                        <span className="font-medium text-white">First Place</span>
                      </div>
                      <span className="text-accent font-medium">{formatCurrency(tournament.prizePool * 0.5)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center font-bold text-dark mr-3">2</div>
                        <span className="font-medium text-white">Second Place</span>
                      </div>
                      <span className="text-accent font-medium">{formatCurrency(tournament.prizePool * 0.3)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center font-bold text-dark mr-3">3</div>
                        <span className="font-medium text-white">Third Place</span>
                      </div>
                      <span className="text-accent font-medium">{formatCurrency(tournament.prizePool * 0.2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'teams' && (
            <div>
              {teams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map(team => (
                    <div key={team.id} className="bg-dark-light rounded-lg p-4">
                      <h3 className="text-white font-medium text-lg mb-2">{team.name}</h3>
                      
                      <div className="space-y-2">
                        {team.members.map((member, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-medium mr-2">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-white font-medium">{member.name}</p>
                              <p className="text-gray-400 text-sm">ID: {member.freeFireId}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Teams Registered Yet</h3>
                  <p className="text-gray-400">Be the first to register your team for this tournament!</p>
                  
                  {isRegistrationOpen && (
                    <button
                      onClick={handleRegister}
                      className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition"
                    >
                      Register Now
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'results' && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Results Coming Soon</h3>
              <p className="text-gray-400">Tournament results will be posted here after completion.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Team Registration Modal */}
      {tournament && (
        <TeamRegistrationModal
          isOpen={registrationModalOpen}
          onClose={() => setRegistrationModalOpen(false)}
          tournamentId={tournament.id}
          tournamentName={tournament.title}
          tournamentType={tournament.tournamentType}
          entryFee={tournament.entryFee}
          maxTeams={tournament.maxTeams}
          registeredTeams={tournament.registeredTeams}
        />
      )}
    </div>
  );
}